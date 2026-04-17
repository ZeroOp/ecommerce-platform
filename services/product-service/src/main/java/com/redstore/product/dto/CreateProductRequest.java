package com.redstore.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CreateProductRequest(
        @NotBlank(message = "brandId is required")
        String brandId,

        @NotBlank(message = "categoryId is required")
        String categoryId,

        @NotBlank(message = "name is required")
        @Size(max = 220, message = "name is too long")
        String name,

        @NotBlank(message = "description is required")
        @Size(max = 8000, message = "description is too long")
        String description,

        @NotNull(message = "price is required")
        @DecimalMin(value = "0.01", message = "price must be positive")
        BigDecimal price,

        @NotNull(message = "imageKeys is required")
        @Size(min = 3, max = 6, message = "Provide between 3 and 6 product images")
        List<@NotBlank(message = "image key cannot be blank") String> imageKeys,

        @NotNull(message = "metadata is required")
        Map<@NotBlank(message = "metadata key cannot be blank") String, @NotBlank(message = "metadata value cannot be blank") String> metadata
) {
}
