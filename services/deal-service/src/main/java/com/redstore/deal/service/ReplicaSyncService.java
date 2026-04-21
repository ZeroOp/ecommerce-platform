package com.redstore.deal.service;

import com.redstore.common.dto.*;
import com.redstore.deal.entity.*;
import com.redstore.deal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReplicaSyncService {

    private final ProductReplicaRepository productReplicaRepository;
    private final BrandReplicaRepository brandReplicaRepository;
    private final CategoryReplicaRepository categoryReplicaRepository;
    private final BrandCategoryReplicaRepository brandCategoryReplicaRepository;

    public ReplicaSyncService(
            ProductReplicaRepository productReplicaRepository,
            BrandReplicaRepository brandReplicaRepository,
            CategoryReplicaRepository categoryReplicaRepository,
            BrandCategoryReplicaRepository brandCategoryReplicaRepository
    ) {
        this.productReplicaRepository = productReplicaRepository;
        this.brandReplicaRepository = brandReplicaRepository;
        this.categoryReplicaRepository = categoryReplicaRepository;
        this.brandCategoryReplicaRepository = brandCategoryReplicaRepository;
    }

    @Transactional
    public void upsertProduct(ProductCreatedEventData data) {
        if (data == null || data.getProductId() == null) return;
        productReplicaRepository.save(ProductReplica.builder()
                .productId(data.getProductId())
                .sellerId(data.getSellerId())
                .brandId(data.getBrandId())
                .categoryId(data.getCategoryId())
                .build());
    }

    @Transactional
    public void upsertBrand(BrandCreatedEventData data) {
        if (data == null || data.getBrandId() == null) return;
        brandReplicaRepository.save(BrandReplica.builder()
                .brandId(data.getBrandId())
                .sellerId(data.getSellerId())
                .build());
        rewriteBrandCategories(data.getBrandId(), data.getCategoryIds());
    }

    @Transactional
    public void upsertBrand(BrandUpdatedEventData data) {
        if (data == null || data.getBrandId() == null) return;
        brandReplicaRepository.save(BrandReplica.builder()
                .brandId(data.getBrandId())
                .sellerId(data.getSellerId())
                .build());
        rewriteBrandCategories(data.getBrandId(), data.getCategoryIds());
    }

    @Transactional
    public void upsertCategory(CategoryCreatedEventData data) {
        if (data == null || data.getCategoryId() == null) return;
        categoryReplicaRepository.save(CategoryReplica.builder()
                .categoryId(data.getCategoryId())
                .createdBy(data.getCreatedBy())
                .build());
    }

    private void rewriteBrandCategories(String brandId, java.util.Set<String> categoryIds) {
        brandCategoryReplicaRepository.findByBrandId(brandId).forEach(brandCategoryReplicaRepository::delete);
        if (categoryIds == null) return;
        for (String categoryId : categoryIds) {
            if (categoryId == null || categoryId.isBlank()) continue;
            brandCategoryReplicaRepository.save(BrandCategoryReplica.builder()
                    .brandId(brandId)
                    .categoryId(categoryId)
                    .build());
        }
    }
}
