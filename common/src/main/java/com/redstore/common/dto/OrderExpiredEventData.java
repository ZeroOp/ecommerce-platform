package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Broadcast on {@code order.expired} when an order sits in CREATED past its
 * expiry window (default 15 min) without a payment update. Inventory treats
 * this as a cancellation for its reservation bookkeeping.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderExpiredEventData {
    private String orderId;
    private String userId;
    private List<OrderItemData> items;
    private Instant expiredAt;
}
