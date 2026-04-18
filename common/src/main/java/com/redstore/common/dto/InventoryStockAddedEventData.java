package com.redstore.common.dto;

import java.time.Instant;

public record InventoryStockAddedEventData(
        String productId,
        String sellerId,
        int quantityAdded,
        int quantityAfter,
        Instant occurredAt
) {}
