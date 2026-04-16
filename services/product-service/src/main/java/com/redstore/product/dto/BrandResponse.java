package com.redstore.product.dto;

import com.redstore.product.entity.BrandStatus;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {

    private String id;
    private String name;
    private String website;
    private String logo;
    private String description;
    private BrandStatus status;
    private String registrationDate;
    private String createdAt;
    private String updatedAt;
}
