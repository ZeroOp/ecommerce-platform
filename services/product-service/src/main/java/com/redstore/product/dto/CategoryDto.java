package com.redstore.product.dto;

import com.redstore.product.entity.Category;

import java.time.Instant;

public record CategoryDto(
        String id,
        String name,
        String slug,
        String description,
        String icon,
        String iconUrl,
        String parentCategoryId,
        String parentCategoryName,
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
                null, // iconUrl will be set by service
                category.getParentCategoryId(),
                null, // parentCategoryName will be set by service
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
    
    public static CategoryDto from(Category category, String iconUrl, String parentCategoryName) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                iconUrl,
                category.getParentCategoryId(),
                parentCategoryName,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
