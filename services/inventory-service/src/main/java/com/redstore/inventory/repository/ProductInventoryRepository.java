package com.redstore.inventory.repository;

import com.redstore.inventory.entity.ProductInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductInventoryRepository extends JpaRepository<ProductInventory, String> {

    List<ProductInventory> findBySellerIdOrderByProductIdAsc(String sellerId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ProductInventory p SET p.quantity = p.quantity - :quantity "
            + "WHERE p.productId = :productId AND p.quantity >= :quantity")
    int decrementIfSufficient(@Param("productId") String productId, @Param("quantity") int quantity);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ProductInventory p SET p.quantity = p.quantity + :quantity WHERE p.productId = :productId")
    int increment(@Param("productId") String productId, @Param("quantity") int quantity);
}
