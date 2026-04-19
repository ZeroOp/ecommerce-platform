package com.redstore.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * A single line the UI sends when placing an order. The UI has the full
 * snapshot already (it's what was shown in the cart), so we trust and
 * persist it verbatim — order-service does not synchronously call product,
 * search, or inventory services to validate these fields.
 *
 * <p>{@code unitPrice} here is expected to be the *effective* price shown
 * to the user (i.e. after any active discount). If a deal was live at the
 * time of cart checkout that reduced the price from 100 → 80, the UI sends
 * {@code 80} and we freeze that into the order history.</p>
 */
public record CreateOrderItemRequest(
        @NotBlank String productId,
        String sellerId,
        String name,
        String imageUrl,
        @Min(1) int quantity,
        @NotNull @PositiveOrZero BigDecimal unitPrice
) {}
