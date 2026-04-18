package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Payload broadcast on {@code product.created}. Carries everything a
 * downstream read model (search-service, cart-service) needs so they can
 * answer storefront reads without a synchronous call back to product-service.
 *
 * <p>{@code imageUrls} are fully-qualified, publicly-readable URLs. Product
 * image prefixes in MinIO are configured with an anonymous read-only policy,
 * so downstream services can store and return them verbatim — no presigning
 * on the read path.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreatedEventData {
    private String productId;
    private String sellerId;
    private String brandId;
    private String brandName;
    private String categoryId;
    private String categorySlug;
    private String categoryName;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private List<String> imageUrls;
    private Map<String, String> metadata;
    private Instant createdAt;
}
