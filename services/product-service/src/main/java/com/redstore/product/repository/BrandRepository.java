package com.redstore.product.repository;

import com.redstore.product.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, String> {

    /**
     * Find all brands by seller ID, ordered by creation date (newest first)
     */
    List<Brand> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    /**
     * Find brand by ID and seller ID
     */
    Optional<Brand> findByIdAndSellerId(String id, String sellerId);

    /**
     * Check if brand exists by name and seller ID
     */
    boolean existsByNameAndSellerId(String name, String sellerId);
}
