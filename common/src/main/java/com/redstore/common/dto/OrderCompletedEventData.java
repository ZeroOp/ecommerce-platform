package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Broadcast on {@code order.completed} after payment succeeds and fulfilment
 * is done. Inventory finalises the reservation (consumes reserved units),
 * notifications send the confirmation email, and search-service can use it
 * for trending-product signals later.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCompletedEventData {
    private String orderId;
    private String userId;
    private List<OrderItemData> items;
    private Instant completedAt;
}
