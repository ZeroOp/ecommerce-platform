package com.redstore.product.dto;

import com.redstore.product.entity.Category;

import java.time.Instant;

public record CategoryDto(
        String id,
        String name,
        String slug,
        String description,
        String icon,
        String parentCategoryId,
        Instant createdAt,
        Instant updatedAt
) {
    public static CategoryDto from(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                category.getParentCategoryId(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
