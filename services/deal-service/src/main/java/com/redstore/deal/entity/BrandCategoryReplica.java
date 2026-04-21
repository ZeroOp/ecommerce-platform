package com.redstore.deal.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@IdClass(BrandCategoryReplica.Pk.class)
@Table(name = "deal_brand_category_replica")
public class BrandCategoryReplica {
    @Id
    private String brandId;
    @Id
    private String categoryId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pk implements Serializable {
        private String brandId;
        private String categoryId;
    }
}
