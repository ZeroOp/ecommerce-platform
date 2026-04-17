package com.redstore.product.service;

import com.redstore.product.dto.PresignedUploadUrlResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class BrandLogoUploadService {

    private final S3Presigner s3Presigner;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.brand-logo-prefix}")
    private String logoPrefix;

    @Value("${minio.presigned-expiry-minutes}")
    private int expiryMinutes;

    public BrandLogoUploadService(S3Presigner s3Presigner) {
        this.s3Presigner = s3Presigner;
    }

    public PresignedUploadUrlResponse createUploadUrl(String sellerId, String fileName, String contentType) {
        String safeSellerId = sanitizePathSegment(sellerId);
        String extension = getSafeExtension(fileName);
        String objectKey = String.format(
                "%s/%s/%s.%s",
                logoPrefix,
                safeSellerId,
                UUID.randomUUID(),
                extension
        );

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .build();

        Duration expiry = Duration.ofMinutes(Math.max(1, expiryMinutes));
        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(expiry)
                        .putObjectRequest(putObjectRequest)
                        .build()
        );

        return new PresignedUploadUrlResponse(
                presigned.url().toString(),
                objectKey,
                Instant.now().plus(expiry)
        );
    }

    public String createReadUrl(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return null;
        }
        Duration expiry = Duration.ofMinutes(Math.max(1, expiryMinutes));
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey.trim())
                .build();
        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(expiry)
                        .getObjectRequest(getObjectRequest)
                        .build()
        );
        return presigned.url().toString();
    }

    private String getSafeExtension(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) return "png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
        if (lower.endsWith(".webp")) return "webp";
        if (lower.endsWith(".svg")) return "svg";
        return "png";
    }

    private String sanitizePathSegment(String value) {
        if (value == null || value.isBlank()) {
            return "unknown-seller";
        }
        String cleaned = value
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("(^-|-$)", "");
        return cleaned.isBlank() ? "unknown-seller" : cleaned;
    }
}
