package com.redstore.cart.catalog;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Read projection used by both the Redis cache and callers inside cart-service.
 * Kept as a record so Jackson can (de)serialize it transparently for Redis.
 */
public record ProductCatalogDto(
        String productId,
        String sellerId,
        String brandId,
        String brandName,
        String categoryId,
        String name,
        String slug,
        BigDecimal price,
        List<String> imageUrls
) {
    public static ProductCatalogDto from(ProductCatalogEntry e) {
        if (e == null) return null;
        return new ProductCatalogDto(
                e.getProductId(),
                e.getSellerId(),
                e.getBrandId(),
                e.getBrandName(),
                e.getCategoryId(),
                e.getName(),
                e.getSlug(),
                e.getPrice(),
                fromCsv(e.getImageUrlsCsv())
        );
    }

    private static List<String> fromCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
