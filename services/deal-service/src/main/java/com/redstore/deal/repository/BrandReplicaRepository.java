package com.redstore.deal.repository;

import com.redstore.deal.entity.BrandReplica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandReplicaRepository extends JpaRepository<BrandReplica, String> {
    List<BrandReplica> findBySellerId(String sellerId);
}
