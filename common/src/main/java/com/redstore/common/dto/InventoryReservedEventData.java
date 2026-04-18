package com.redstore.common.dto;

import java.time.Instant;

public record InventoryReservedEventData(
        String productId,
        String orderRef,
        int quantity,
        int quantityAfter,
        Instant occurredAt
) {}
