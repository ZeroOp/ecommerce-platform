package com.redstore.search.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Document shape persisted in OpenSearch for the storefront search index.
 *
 * <p>We intentionally copy <em>display-ready</em> fields from product-service
 * (brand name, category name, description, image URLs) so the storefront can
 * render cards and product detail straight from the search index — no
 * round-trip to product-service on the read path.</p>
 *
 * <p>{@code imageUrls} are absolute, publicly-readable URLs — the image
 * prefixes on MinIO are configured with anonymous read access, so this
 * service never needs to presign anything.</p>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProductDoc(
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
        Instant indexedAt
) {}
