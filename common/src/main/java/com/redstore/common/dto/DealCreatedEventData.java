package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Broadcast on {@code deal.created} when a seller (or admin) creates a new
 * discount offer. Read-model services denormalize this into their local
 * projections:
 * <ul>
 *   <li>search-service applies the discount to matching product docs
 *       (scope = PRODUCT / CATEGORY / GLOBAL);</li>
 *   <li>cart-service applies it to its local catalog replica so carts
 *       reflect the same effective price the shopper saw.</li>
 * </ul>
 *
 * <p>{@code expiresAt} is the seller-chosen expiry; expiration-service
 * schedules a {@code deal.expired} event for that moment.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealCreatedEventData {
    private String dealId;
    /** {@code PRODUCT} / {@code CATEGORY} / {@code GLOBAL}. */
    private String scope;
    /** Null unless scope = PRODUCT. */
    private String productId;
    /** Null unless scope = CATEGORY. */
    private String categoryId;
    /** Null for GLOBAL-scoped offers (admin-wide). */
    private String sellerId;
    /** Percentage off the original price, e.g. 15 means 15%. */
    private BigDecimal discountPercentage;
    private String title;
    private Instant startsAt;
    private Instant expiresAt;
    private Instant createdAt;
}
