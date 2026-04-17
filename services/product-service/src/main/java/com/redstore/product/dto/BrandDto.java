package com.redstore.product.dto;

import com.redstore.product.entity.Brand;

import java.time.Instant;
import java.util.Set;

public record BrandDto(
        String id,
        String name,
        String website,
        String description,
        String sellerId,
        String status,
        String logo,
        String logoUrl,
        Set<String> categoryIds,
        Instant createdAt,
        Instant updatedAt
) {
    public static BrandDto from(Brand brand) {
        return from(brand, null);
    }

    public static BrandDto from(Brand brand, String logoUrl) {
        return new BrandDto(
                brand.getId(),
                brand.getName(),
                brand.getWebsite(),
                brand.getDescription(),
                brand.getSellerId(),
                brand.getStatus().name(),
                brand.getLogo(),
                logoUrl,
                brand.getCategories().stream().map(c -> c.getId()).collect(java.util.stream.Collectors.toSet()),
                brand.getCreatedAt(),
                brand.getUpdatedAt()
        );
    }
}
