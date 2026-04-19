package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Broadcast on {@code deal.cancelled} when a seller manually removes an
 * active offer before its natural expiry. Read-model services remove the
 * discount from their projections (same effect as {@code deal.expired} but
 * semantically distinct so we can surface it to the UI differently).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealCancelledEventData {
    private String dealId;
    private String scope;
    private String productId;
    private String categoryId;
    private String sellerId;
    private Instant cancelledAt;
}
