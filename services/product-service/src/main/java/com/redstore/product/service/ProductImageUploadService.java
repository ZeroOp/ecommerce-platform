package com.redstore.product.service;

import com.redstore.product.dto.PresignedUploadUrlResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProductImageUploadService {

    private final S3Presigner s3Presigner;

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.product-image-prefix}")
    private String prefix;

    @Value("${minio.presigned-expiry-minutes}")
    private int expiryMinutes;

    public ProductImageUploadService(S3Presigner s3Presigner) {
        this.s3Presigner = s3Presigner;
    }

    public PresignedUploadUrlResponse createUploadUrl(String sellerId, String fileName, String contentType) {
        String safeSeller = sanitizePathSegment(sellerId);
        String extension = getSafeExtension(fileName);
        String objectKey = String.format(
                "%s/%s/%s.%s",
                prefix,
                safeSeller,
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

    /**
     * Returns a stable, publicly-readable URL for the object. Product image
     * prefixes are configured with an anonymous read-only bucket policy, so
     * we build a plain {@code endpoint/bucket/key} URL instead of presigning.
     *
     * <p>This method is intentionally tolerant: if the caller already passes
     * a fully-qualified URL (e.g. a legacy row or enriched payload), it is
     * returned as-is.</p>
     */
    public String createReadUrl(String keyOrUrl) {
        return PublicObjectUrl.build(endpoint, bucket, keyOrUrl);
    }

    private String getSafeExtension(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) {
            return "png";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "jpg";
        }
        if (lower.endsWith(".webp")) {
            return "webp";
        }
        return "jpg";
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
