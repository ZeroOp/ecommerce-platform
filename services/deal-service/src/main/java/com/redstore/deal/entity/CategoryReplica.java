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
@Table(name = "deal_category_replica")
public class CategoryReplica {
    @Id
    private String categoryId;
    private String createdBy;
}
