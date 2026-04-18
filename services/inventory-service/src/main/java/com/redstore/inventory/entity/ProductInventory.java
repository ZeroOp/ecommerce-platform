package com.redstore.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInventory {

    @Id
    @Column(length = 80)
    private String productId;

    @Column(nullable = false, length = 80)
    private String sellerId;

    /** Sellable on-hand quantity (reservations deduct from this). */
    @Column(nullable = false)
    private int quantity;
}
