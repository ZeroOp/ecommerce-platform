package com.redstore.search.controller;

import com.redstore.search.dto.ProductSearchHit;
import com.redstore.search.dto.SearchResponse;
import com.redstore.search.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/products")
    public SearchResponse searchProducts(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "categoryIds", required = false) java.util.List<String> categoryIds,
            @RequestParam(value = "brandId", required = false) String brandId,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return searchService.searchProducts(q, categoryId, categoryIds, brandId, limit);
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductSearchHit> getById(@PathVariable("productId") String productId) {
        ProductSearchHit hit = searchService.getById(productId);
        if (hit == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(hit);
    }
}
