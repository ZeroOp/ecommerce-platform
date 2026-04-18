package com.redstore.inventory.repository;

import com.redstore.inventory.entity.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockReservationRepository extends JpaRepository<StockReservation, String> {

    Optional<StockReservation> findByOrderRef(String orderRef);
}
