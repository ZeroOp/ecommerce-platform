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

import java.time.Instant;

@Entity
@Table(name = "stock_reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReservation {

    @Id
    @Column(length = 80)
    private String id;

    @Column(nullable = false, length = 80)
    private String productId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, length = 128, unique = true)
    private String orderRef;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant releasedAt;
}
