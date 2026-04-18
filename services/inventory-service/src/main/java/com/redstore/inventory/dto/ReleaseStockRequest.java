package com.redstore.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record ReleaseStockRequest(
        @NotBlank String orderRef
) {}
