package com.redstore.deal.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "deal_product_replica")
public class ProductReplica {
    @Id
    private String productId;
    private String sellerId;
    private String brandId;
    private String categoryId;
}
