package com.redstore.product.controller;

import com.redstore.common.annotations.RequireAdmin;
import com.redstore.common.annotations.RequireSeller;
import com.redstore.product.dto.BrandDto;
import com.redstore.product.dto.CreateBrandLogoUploadUrlRequest;
import com.redstore.product.dto.CreateBrandRequest;
import com.redstore.product.dto.PresignedUploadUrlResponse;
import com.redstore.product.dto.UpdateBrandRequest;
import com.redstore.product.dto.UpdateBrandStatusRequest;
import com.redstore.product.service.AuthContextService;
import com.redstore.product.service.BrandLogoUploadService;
import com.redstore.product.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;
    private final BrandLogoUploadService brandLogoUploadService;
    private final AuthContextService authContextService;

    public BrandController(
            BrandService brandService,
            BrandLogoUploadService brandLogoUploadService,
            AuthContextService authContextService
    ) {
        this.brandService = brandService;
        this.brandLogoUploadService = brandLogoUploadService;
        this.authContextService = authContextService;
    }

    @GetMapping
    public List<BrandDto> getAllBrands(
            @RequestParam(required = false) Set<String> categoryIds,
            @RequestParam(required = false) String status
    ) {
        return brandService.listBrands(categoryIds, status);
    }

    @GetMapping("/my")
    @RequireSeller
    public List<BrandDto> getMyBrands() {
        String sellerId = authContextService.requireCurrentUserId();
        return brandService.listBrandsBySeller(sellerId);
    }

    @PostMapping
    @RequireSeller
    public BrandDto createBrand(@Valid @RequestBody CreateBrandRequest request) {
        return brandService.createBrand(request);
    }

    @PutMapping("/{brandId}")
    @RequireSeller
    public BrandDto updateBrand(
            @PathVariable String brandId,
            @Valid @RequestBody UpdateBrandRequest request
    ) {
        return brandService.updateBrand(brandId, request);
    }

    @PatchMapping("/{brandId}/status")
    @RequireAdmin
    public BrandDto updateBrandStatus(
            @PathVariable String brandId,
            @Valid @RequestBody UpdateBrandStatusRequest request
    ) {
        return brandService.updateBrandStatus(brandId, request.status());
    }

    @PostMapping("/logo/presigned-upload")
    @RequireSeller
    public PresignedUploadUrlResponse createLogoUploadUrl(
            @Valid @RequestBody CreateBrandLogoUploadUrlRequest request
    ) {
        String sellerId = authContextService.requireCurrentUserId();
        return brandLogoUploadService.createUploadUrl(sellerId, request.fileName(), request.contentType());
    }
}
