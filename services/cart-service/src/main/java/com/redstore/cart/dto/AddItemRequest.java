package com.redstore.cart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddItemRequest(
        @NotBlank String productId,
        @NotNull @Min(1) @Max(99) Integer quantity,
        String name,
        String brand,
        String image,
        Double price,
        Double originalPrice,
        String slug
) {}
