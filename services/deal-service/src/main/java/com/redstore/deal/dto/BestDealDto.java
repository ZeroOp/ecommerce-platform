package com.redstore.deal.dto;

import com.redstore.deal.entity.DealScope;

import java.math.BigDecimal;
import java.time.Instant;

public record BestDealDto(
        String productId,
        String dealId,
        DealScope scope,
        BigDecimal discountPercentage,
        Instant expiresAt
) {
}
