package com.redstore.deal.dto;

import com.redstore.deal.entity.DealScope;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateDealRequest(
        @NotNull DealScope scope,
        String productId,
        String brandId,
        String categoryId,
        @NotNull @DecimalMin("0.01") @DecimalMax("99.99") BigDecimal discountPercentage,
        @NotBlank @Size(max = 120) String title,
        Instant startsAt,
        @NotNull Instant expiresAt
) {
}
