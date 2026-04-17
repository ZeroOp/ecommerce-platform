package com.redstore.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCategoryIconUploadUrlRequest(
        @NotBlank(message = "fileName is required")
        @Size(max = 255, message = "fileName cannot exceed 255 characters")
        String fileName,

        @NotBlank(message = "contentType is required")
        @Pattern(
                regexp = "image/(png|jpeg|jpg|webp|svg\\+xml)",
                message = "contentType must be an image mime type"
        )
        String contentType
) {
}
