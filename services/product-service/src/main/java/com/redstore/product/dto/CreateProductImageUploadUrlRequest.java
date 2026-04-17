package com.redstore.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProductImageUploadUrlRequest(
        @NotBlank @Size(max = 255) String fileName,
        @NotBlank @Size(max = 120) String contentType
) {
}
