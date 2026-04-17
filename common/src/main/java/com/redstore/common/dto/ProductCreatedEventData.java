package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreatedEventData {
    private String productId;
    private String sellerId;
    private String brandId;
    private String categoryId;
    private String name;
    private String slug;
    private BigDecimal price;
    private Map<String, String> metadata;
    private Instant createdAt;
}
