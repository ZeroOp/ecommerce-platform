package com.redstore.inventory.dto;

public record PublicQuantityDto(
        String productId,
        int quantityAvailable
) {}
