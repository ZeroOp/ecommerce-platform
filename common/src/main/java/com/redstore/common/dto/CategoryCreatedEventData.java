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
public class CategoryCreatedEventData {
    private String categoryId;
    private String name;
    private String slug;
    private String parentCategoryId;
    private String createdBy;
    private Instant createdAt;
}
