package com.redstore.product.controller;

import com.redstore.common.annotations.RequireSeller;
import com.redstore.product.dto.CreateProductImageUploadUrlRequest;
import com.redstore.product.dto.CreateProductRequest;
import com.redstore.product.dto.PresignedUploadUrlResponse;
import com.redstore.product.dto.ProductDto;
import com.redstore.product.service.AuthContextService;
import com.redstore.product.service.ProductImageUploadService;
import com.redstore.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products")
public class SellerProductController {

    private final ProductService productService;
    private final ProductImageUploadService productImageUploadService;
    private final AuthContextService authContextService;

    public SellerProductController(
            ProductService productService,
            ProductImageUploadService productImageUploadService,
            AuthContextService authContextService
    ) {
        this.productService = productService;
        this.productImageUploadService = productImageUploadService;
        this.authContextService = authContextService;
    }

    @GetMapping
    @RequireSeller
    public List<ProductDto> listMine() {
        return productService.listMine();
    }

    @GetMapping("/{productId}")
    @RequireSeller
    public ProductDto getMine(@PathVariable("productId") String productId) {
        String sellerId = authContextService.requireCurrentUserId();
        return productService.getByIdForSeller(sellerId, productId);
    }

    @PostMapping
    @RequireSeller
    public ProductDto create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @PostMapping("/images/presigned-upload")
    @RequireSeller
    public PresignedUploadUrlResponse createImageUploadUrl(
            @Valid @RequestBody CreateProductImageUploadUrlRequest request
    ) {
        authContextService.requireActiveSellerAccount();
        String sellerId = authContextService.requireCurrentUserId();
        return productImageUploadService.createUploadUrl(sellerId, request.fileName(), request.contentType());
    }
}
