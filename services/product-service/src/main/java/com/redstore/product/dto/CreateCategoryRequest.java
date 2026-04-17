package com.redstore.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank(message = "name is required")
        @Size(max = 120, message = "name cannot exceed 120 characters")
        String name,

        @Size(max = 255, message = "slug cannot exceed 255 characters")
        String slug,

        @Size(max = 1000, message = "description cannot exceed 1000 characters")
        String description,

        @Size(max = 255, message = "icon cannot exceed 255 characters")
        String icon,

        String parentCategoryId
) {
}
