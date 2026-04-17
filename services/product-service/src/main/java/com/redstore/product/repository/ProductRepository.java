package com.redstore.product.repository;

import com.redstore.product.entity.BrandStatus;
import com.redstore.product.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    Optional<Product> findBySlug(String slug);

    List<Product> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    @Query("""
            SELECT p FROM Product p
            WHERE p.brandId IN (SELECT b.id FROM Brand b WHERE b.status = :brandStatus)
            AND (:categoryId IS NULL OR p.categoryId = :categoryId)
            ORDER BY p.createdAt DESC
            """)
    List<Product> findPublishedForStorefront(
            @Param("brandStatus") BrandStatus brandStatus,
            @Param("categoryId") String categoryId,
            Pageable pageable
    );
}
