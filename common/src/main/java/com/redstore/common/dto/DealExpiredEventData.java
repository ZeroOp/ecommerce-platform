package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Broadcast on {@code deal.expired} by expiration-service when a deal's
 * {@code expiresAt} arrives. offers-service listens and marks the offer
 * row as EXPIRED; search-service and cart-service listen to drop the
 * denormalized discount from their projections.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealExpiredEventData {
    private String dealId;
    private String scope;
    private String productId;
    private String brandId;
    private String categoryId;
    private String sellerId;
    private Instant expiredAt;
}
