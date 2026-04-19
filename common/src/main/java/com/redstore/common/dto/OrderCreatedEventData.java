package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Broadcast on {@code order.created} when a user places a new order. Inventory
 * listens to reserve stock; search/notifications/analytics listen for their
 * own projections. All URLs and strings are snapshotted at placement time so
 * later edits to the product don't rewrite the order history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEventData {
    private String orderId;
    private String userId;
    private String userEmail;
    private List<OrderItemData> items;
    private BigDecimal subtotal;
    private Instant createdAt;
    private Instant expiresAt;
}
