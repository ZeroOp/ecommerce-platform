package com.redstore.search.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Storefront-facing search hit. {@code imageUrls} are stable, public URLs —
 * MinIO serves the image prefixes with anonymous read access, so the client
 * can fetch them directly without any signing step.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProductSearchHit(
        String productId,
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
        Double score
) {}
