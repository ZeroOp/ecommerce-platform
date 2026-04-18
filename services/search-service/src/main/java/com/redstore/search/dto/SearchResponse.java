package com.redstore.search.dto;

import java.util.List;

public record SearchResponse(
        String query,
        long total,
        int took,
        List<ProductSearchHit> hits
) {}
