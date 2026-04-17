package com.redstore.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UpdateBrandRequest(
        @NotBlank(message = "name is required")
        @Size(max = 150, message = "name cannot exceed 150 characters")
        String name,

        @Size(max = 500, message = "website cannot exceed 500 characters")
        String website,

        @NotBlank(message = "description is required")
        @Size(max = 1000, message = "description cannot exceed 1000 characters")
        String description,

        @Size(max = 1000, message = "logo cannot exceed 1000 characters")
        String logo,

        Set<String> categoryIds
) {
}
