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
@Table(name = "deal_brand_replica")
public class BrandReplica {
    @Id
    private String brandId;
    private String sellerId;
}
