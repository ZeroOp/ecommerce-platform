package com.redstore.cart.dto;

import java.util.List;

public record CartDto(
        String userId,
        List<CartItemDto> items,
        int totalItems,
        double subtotal
) {}
