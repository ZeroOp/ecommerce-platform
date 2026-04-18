package com.redstore.common.dto;

import java.time.Instant;

public record InventoryReleasedEventData(
        String productId,
        String orderRef,
        int quantityRestored,
        int quantityAfter,
        Instant occurredAt
) {}
