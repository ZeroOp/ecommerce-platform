package com.redstore.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MetadataFieldDefinition(String key, String label) {
}
