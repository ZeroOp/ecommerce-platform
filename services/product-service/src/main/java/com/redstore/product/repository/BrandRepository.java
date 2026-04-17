package com.redstore.product.repository;

import com.redstore.product.entity.Brand;
import com.redstore.product.entity.BrandStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BrandRepository extends JpaRepository<Brand, String> {

    /**
     * Find brands by seller ID, ordered by creation date (newest first)
     */
    List<Brand> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    /**
     * Find brand by ID and seller ID (for authorization)
     */
    Optional<Brand> findByIdAndSellerId(String id, String sellerId);

    /**
     * Check if brand name already exists for a specific seller
     */
    boolean existsByNameAndSellerId(String name, String sellerId);

    /**
     * Check if brand name already exists globally (for uniqueness)
     */
    boolean existsByName(String name);

    /**
     * Find brands by status
     */
    List<Brand> findByStatus(BrandStatus status);

    /**
     * Find brands by seller ID and status
     */
    List<Brand> findBySellerIdAndStatus(String sellerId, BrandStatus status);

    /**
     * Count brands by seller ID
     */
    long countBySellerId(String sellerId);

    /**
     * Search brands by name (case-insensitive)
     */
    @Query("SELECT b FROM Brand b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Brand> findByNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Find approved brands for public display
     */
    List<Brand> findByStatusOrderByCreatedAtDesc(BrandStatus status);

    @Query("""
            SELECT DISTINCT b FROM Brand b
            LEFT JOIN b.categories c
            WHERE (:categoryIds IS NULL OR c.id IN :categoryIds)
            AND (:status IS NULL OR b.status = :status)
            ORDER BY b.createdAt DESC
            """)
    List<Brand> searchBrands(@Param("categoryIds") Set<String> categoryIds, @Param("status") BrandStatus status);
}
