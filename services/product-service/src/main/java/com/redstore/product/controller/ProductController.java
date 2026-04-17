package com.redstore.product.controller;

import com.redstore.product.dto.ProductDto;
import com.redstore.product.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDto> listPublished(
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "categorySlug", required = false) String categorySlug,
            @RequestParam(value = "limit", defaultValue = "24") int limit
    ) {
        return productService.listStorefront(categoryId, categorySlug, limit);
    }

    @GetMapping("/{productId}")
    public ProductDto getById(@PathVariable("productId") String productId) {
        return productService.getById(productId);
    }
}
