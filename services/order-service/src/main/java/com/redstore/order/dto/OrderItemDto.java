package com.redstore.order.dto;

import com.redstore.order.entity.OrderItemEntity;

import java.math.BigDecimal;

public record OrderItemDto(
        String productId,
        String sellerId,
        String name,
        String imageUrl,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
    public static OrderItemDto from(OrderItemEntity e) {
        return new OrderItemDto(
                e.getProductId(),
                e.getSellerId(),
                e.getName(),
                e.getImageUrl(),
                e.getQuantity(),
                e.getUnitPrice(),
                e.getLineTotal()
        );
    }
}
