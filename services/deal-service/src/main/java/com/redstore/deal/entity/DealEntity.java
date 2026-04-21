package com.redstore.deal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "deals", indexes = {
        @Index(name = "idx_deals_seller_status", columnList = "sellerId,status"),
        @Index(name = "idx_deals_target_status", columnList = "targetId,status"),
        @Index(name = "idx_deals_expires_at", columnList = "expiresAt")
})
public class DealEntity {
    @Id
    private String id;

    @Column(nullable = false)
    private String sellerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealScope scope;

    /** Null for SELLER-scoped deals. */
    private String targetId;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Instant startsAt;

    @Column(nullable = false)
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant cancelledAt;
    private Instant expiredAt;
}
