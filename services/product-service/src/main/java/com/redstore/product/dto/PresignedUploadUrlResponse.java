package com.redstore.product.dto;

import java.time.Instant;

public record PresignedUploadUrlResponse(
        String uploadUrl,
        String objectKey,
        Instant expiresAt
) {
}
