package com.redstore.order.dto;

import com.redstore.order.entity.OrderEntity;
import com.redstore.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDto(
        String id,
        String userId,
        String userEmail,
        OrderStatus status,
        BigDecimal subtotal,
        List<OrderItemDto> items,
        Instant createdAt,
        Instant updatedAt,
        Instant expiresAt,
        Instant cancelledAt,
        Instant completedAt,
        String cancellationReason
) {
    public static OrderDto from(OrderEntity e) {
        return new OrderDto(
                e.getId(),
                e.getUserId(),
                e.getUserEmail(),
                e.getStatus(),
                e.getSubtotal(),
                e.getItems() == null ? List.of() : e.getItems().stream().map(OrderItemDto::from).toList(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getExpiresAt(),
                e.getCancelledAt(),
                e.getCompletedAt(),
                e.getCancellationReason()
        );
    }
}
