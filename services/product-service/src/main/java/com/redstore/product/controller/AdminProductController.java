package com.redstore.product.controller;

import com.redstore.common.annotations.RequireAdmin;
import com.redstore.product.dto.ProductDto;
import com.redstore.product.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @RequireAdmin
    public List<ProductDto> listAll() {
        return productService.listAll();
    }
}
