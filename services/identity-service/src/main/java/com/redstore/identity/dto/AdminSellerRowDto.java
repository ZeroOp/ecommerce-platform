package com.redstore.identity.dto;

import lombok.Builder;

@Builder
public record AdminSellerRowDto(
        String email,
        boolean active,
        String userId
) {
}
