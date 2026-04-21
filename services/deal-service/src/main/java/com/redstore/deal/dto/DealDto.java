package com.redstore.deal.dto;

import com.redstore.deal.entity.DealEntity;
import com.redstore.deal.entity.DealScope;
import com.redstore.deal.entity.DealStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record DealDto(
        String id,
        String sellerId,
        DealScope scope,
        String targetId,
        BigDecimal discountPercentage,
        String title,
        Instant startsAt,
        Instant expiresAt,
        DealStatus status,
        Instant createdAt
) {
    public static DealDto from(DealEntity e) {
        return new DealDto(
                e.getId(),
                e.getSellerId(),
                e.getScope(),
                e.getTargetId(),
                e.getDiscountPercentage(),
                e.getTitle(),
                e.getStartsAt(),
                e.getExpiresAt(),
                e.getStatus(),
                e.getCreatedAt()
        );
    }
}
