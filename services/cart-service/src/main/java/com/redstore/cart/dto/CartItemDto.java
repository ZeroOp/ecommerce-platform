package com.redstore.cart.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CartItemDto(
        String productId,
        int quantity,
        String name,
        String brand,
        String image,
        Double price,
        Double originalPrice,
        String slug,
        Integer availableQuantity,
        Instant addedAt
) {}
