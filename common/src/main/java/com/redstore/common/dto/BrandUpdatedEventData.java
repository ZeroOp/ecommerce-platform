package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandUpdatedEventData {
    private String brandId;
    private String sellerId;
    private String name;
    private String website;
    private String description;
    private String logo;
    private String status;
    private Set<String> categoryIds;
    private Instant updatedAt;
}
