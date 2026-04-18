package com.redstore.cart.dto;

public record CheckoutIssueDto(
        String productId,
        String name,
        int requested,
        int available,
        String reason
) {}
