package com.redstore.deal.repository;

import com.redstore.deal.entity.BrandCategoryReplica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandCategoryReplicaRepository extends JpaRepository<BrandCategoryReplica, BrandCategoryReplica.Pk> {
    List<BrandCategoryReplica> findByBrandId(String brandId);
    boolean existsByBrandIdAndCategoryId(String brandId, String categoryId);
}
