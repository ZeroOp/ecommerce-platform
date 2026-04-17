package com.redstore.product.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ProductDto(
        String id,
        String sellerId,
        String brandId,
        String brandName,
        String categoryId,
        String categorySlug,
        String categoryName,
        String name,
        String slug,
        String description,
        BigDecimal price,
        List<String> imageUrls,
        Map<String, String> metadata,
        Instant createdAt,
        Instant updatedAt
) {
}
