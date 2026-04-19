package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Snapshot of a single line in an order at the moment the event was emitted.
 * Captures enough for downstream services (inventory, search, notifications)
 * to act without calling back to order-service or product-service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemData {
    private String productId;
    private String sellerId;
    private String name;
    private String imageUrl;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
