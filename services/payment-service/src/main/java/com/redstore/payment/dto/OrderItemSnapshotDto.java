package com.redstore.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OrderItemSnapshotDto(
        String productId,
        String sellerId,
        String name,
        String imageUrl,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {}
