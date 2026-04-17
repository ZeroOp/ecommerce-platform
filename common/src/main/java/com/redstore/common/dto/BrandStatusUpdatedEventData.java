package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandStatusUpdatedEventData {
    private String brandId;
    private String sellerId;
    private String status;
    private String updatedBy;
    private Instant updatedAt;
}
