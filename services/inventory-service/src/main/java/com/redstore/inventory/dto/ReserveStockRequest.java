package com.redstore.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReserveStockRequest(
        @NotBlank String productId,
        @NotNull @Min(1) Integer quantity,
        /** Stable id from the order flow (order id or reservation id). */
        @NotBlank String orderRef
) {}
