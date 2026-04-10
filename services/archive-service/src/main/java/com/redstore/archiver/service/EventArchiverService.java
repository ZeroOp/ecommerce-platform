package com.redstore.archiver.service;

import io.nats.client.JetStreamSubscription;
import io.nats.client.Message;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventArchiverService {
    private final List<JetStreamSubscription> archiverSubscriptions;
    private final S3Client s3Client;

    @Value("${minio.bucket}")
    private String bucketName;

    @Value("${archiver.batch-size}")
    private int batchSize;

    private static final DateTimeFormatter DATE_PATH = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter TIME_PREFIX = DateTimeFormatter.ofPattern("HH-mm-ss");

    @PostConstruct
    public void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            log.info("Bucket '{}' already exists", bucketName);
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            log.info("Created bucket '{}'", bucketName);
        }
    }

    @Scheduled(fixedDelayString = "${archiver.flush-interval-seconds}000")
    public void archiveEvents() {
        for (JetStreamSubscription sub: archiverSubscriptions) {
            try {
                drainAndArchive(sub);
            } catch (Exception e) {
                log.error("Error archiving from subscriptions: {}", sub.getSubject(), e);
            }
        }
    }
    private void drainAndArchive(JetStreamSubscription sub) {
        List<Message> messages = sub.fetch(batchSize, Duration.ofSeconds(2));
        if (messages == null || messages.isEmpty()) {
            return;
        }
        Map<String, List<Message>> grouped = groupBySubject(messages);

        for (Map.Entry<String, List<Message>> entry: grouped.entrySet()) {
            String subject = entry.getKey();
            List<Message> batch = entry.getValue();

            try {
                String jsonlContent = buildJsonl(batch);
                String key = buildObjectKey(subject);

                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .contentType("application/x-ndjson")
                                .build(),
                        RequestBody.fromString(jsonlContent)
                );
                batch.forEach(Message::ack);
                log.info("Archived {} evetns to {}/{}", batch.size(), bucketName, key);
            } catch (Exception e) {
                log.error("Failed to archive {} events for subject '{}', will retry next cycle",
                        batch.size(), subject, e);
            }
        }
    }

    private Map<String, List<Message>> groupBySubject(List<Message> messages) {
        Map<String, List<Message>> grouped = new LinkedHashMap<>();

        for (Message msg: messages) {
            if (msg.isJetStream()) {
                grouped.computeIfAbsent(msg.getSubject(), k -> new ArrayList<>()).add(msg);
            }
        }
        return grouped;
    }

    private String buildJsonl(List<Message> messages) {
        StringBuilder sb = new StringBuilder();

        for (Message msg: messages) {
            sb.append(new String(msg.getData(), StandardCharsets.UTF_8));
            sb.append('\n');
        }
        return sb.toString();
    }

    private String buildObjectKey(String subject) {
        LocalDateTime now = LocalDateTime.now();
        String[] parts = subject.split("\\.", 2);
        String domain = parts[0];
        String event = parts.length > 1 ? parts[1] : "unknown";

        return String.format("%s/%s/%s/%s-%s.jsonl",
                domain,
                event,
                now.format(DATE_PATH),
                now.format(TIME_PREFIX),
                UUID.randomUUID().toString().substring(0,8));
    }
}
