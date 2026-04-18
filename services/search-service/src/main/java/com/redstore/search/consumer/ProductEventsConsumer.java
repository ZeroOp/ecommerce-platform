package com.redstore.search.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.common.dto.ProductCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.search.service.ProductIndexService;
import io.nats.client.JetStreamSubscription;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * Polls our dedicated NATS pull subscription on a fixed cadence and feeds
 * {@code product.created} events into the OpenSearch index. Any other subject
 * that falls under {@code product.>} is ACK'd with a warning so the consumer
 * does not stall on payloads we do not understand yet.
 */
@Slf4j
@Component
public class ProductEventsConsumer {

    private final JetStreamSubscription subscription;
    private final ProductIndexService indexService;
    private final ObjectMapper objectMapper;

    @Value("${search.nats.fetch-size}")
    private int fetchSize;

    public ProductEventsConsumer(
            JetStreamSubscription productEventsSubscription,
            ProductIndexService indexService,
            ObjectMapper objectMapper
    ) {
        this.subscription = productEventsSubscription;
        this.indexService = indexService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelayString = "${search.nats.fetch-interval-ms}")
    public void poll() {
        List<Message> batch;
        try {
            batch = subscription.fetch(fetchSize, Duration.ofSeconds(1));
        } catch (Exception e) {
            log.warn("search-service: fetch failed: {}", e.getMessage());
            return;
        }
        if (batch == null || batch.isEmpty()) {
            return;
        }

        for (Message msg : batch) {
            try {
                handle(msg);
                msg.ack();
            } catch (Exception e) {
                log.error("search-service: failed handling subject {}: {}",
                        msg.getSubject(), e.getMessage(), e);
                // NAK with a short backoff so JetStream redelivers.
                msg.nakWithDelay(Duration.ofSeconds(5));
            }
        }
    }

    private void handle(Message msg) throws Exception {
        String subject = msg.getSubject();
        if (Subjects.PRODUCT_CREATED.getValue().equals(subject)) {
            ProductCreatedEventData event = objectMapper.readValue(msg.getData(), ProductCreatedEventData.class);
            indexService.indexFromCreatedEvent(event);
            return;
        }
        // Future: product.updated / product.deleted — for now we ack and drop.
        log.debug("search-service: ignoring event subject {}", subject);
    }
}
