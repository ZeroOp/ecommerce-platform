package com.redstore.deal.repository;

import com.redstore.deal.entity.DealEntity;
import com.redstore.deal.entity.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface DealRepository extends JpaRepository<DealEntity, String> {
    List<DealEntity> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    List<DealEntity> findByStatusAndStartsAtLessThanEqualAndExpiresAtGreaterThan(
            DealStatus status,
            Instant startsAtLte,
            Instant expiresAtGt
    );
}
