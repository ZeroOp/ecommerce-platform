package com.redstore.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * JSON shape of {@code GET /api/orders/{id}} from order-service (subset of fields we need).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OrderSnapshotDto(
        String id,
        String userId,
        String userEmail,
        String status,
        BigDecimal subtotal,
        List<OrderItemSnapshotDto> items,
        Instant createdAt,
        Instant updatedAt,
        Instant expiresAt,
        Instant cancelledAt,
        Instant completedAt,
        String cancellationReason
) {}
