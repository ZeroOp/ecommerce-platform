package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Broadcast on {@code order.cancelled}. Inventory listens and releases the
 * reservation keyed on {@code orderId}. Idempotent consumers please — the
 * same cancellation can arrive more than once under at-least-once delivery.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCancelledEventData {
    private String orderId;
    private String userId;
    private List<OrderItemData> items;
    private String reason;
    private Instant cancelledAt;
}
