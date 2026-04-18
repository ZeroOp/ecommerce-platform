package com.redstore.inventory.dto;

public record InventoryLineDto(
        String productId,
        String sellerId,
        int quantity
) {}
