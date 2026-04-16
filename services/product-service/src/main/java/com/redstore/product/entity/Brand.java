package com.redstore.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "brands", 
       uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Brand {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String website;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String sellerId;

    @Column(length = 20)
    private String contactPhone;

    @Column(length = 500)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BrandStatus status;

    @Column(length = 1000)
    private String logo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
