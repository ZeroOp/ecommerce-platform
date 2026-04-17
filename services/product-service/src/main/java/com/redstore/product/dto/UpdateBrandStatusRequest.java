package com.redstore.product.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateBrandStatusRequest(
        @NotBlank(message = "status is required")
        String status
) {
}
