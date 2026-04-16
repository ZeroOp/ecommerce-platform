package com.redstore.product.controller;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.utils.UserContext;
import com.redstore.common.annotations.RequireSeller;
import com.redstore.product.dto.BrandRequest;
import com.redstore.product.dto.BrandResponse;
import com.redstore.product.dto.ApiResponse;
import com.redstore.product.service.BrandService;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.exceptions.ForbiddenException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
@Slf4j
public class BrandController {

    private final BrandService brandService;

    /**
     * POST /api/product/brands - Create new brand
     * Requires user context and SELLER role
     */
    @PostMapping
    @RequireSeller
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @ModelAttribute BrandRequest brandRequest) {
        
        UserPayload userContext = UserContext.getUser();
        log.info("POST /api/product/brands - Brand creation request from user: {}", 
                userContext != null ? userContext.getEmail() : "unknown");
        
        try {
            ApiResponse<BrandResponse> response = brandService.createBrand(brandRequest, userContext);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in brand creation endpoint: {}", e.getMessage(), e);
            
            ApiResponse<BrandResponse> errorResponse = ApiResponse.<BrandResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
                    
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * GET /api/product/brands - Get all brands for current seller
     * Requires user context and SELLER role
     */
    @GetMapping
    @RequireSeller
    public ResponseEntity<ApiResponse<java.util.List<BrandResponse>>> getBrands() {
        
        UserPayload userContext = UserContext.getUser();
        log.info("GET /api/product/brands - Fetch brands request from user: {}", 
                userContext != null ? userContext.getEmail() : "unknown");
        
        try {
            ApiResponse<java.util.List<BrandResponse>> response = brandService.getBrands(userContext);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in get brands endpoint: {}", e.getMessage(), e);
            
            ApiResponse<java.util.List<BrandResponse>> errorResponse = ApiResponse.<java.util.List<BrandResponse>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
                    
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * PUT /api/product/brands/{id} - Update existing brand
     * Requires user context and SELLER role
     */
    @PutMapping("/{id}")
    @RequireSeller
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable String id,
            @Valid @ModelAttribute BrandRequest brandRequest) {
        
        UserPayload userContext = UserContext.getUser();
        log.info("PUT /api/product/brands/{} - Brand update request from user: {}", 
                id, userContext != null ? userContext.getEmail() : "unknown");
        
        try {
            ApiResponse<BrandResponse> response = brandService.updateBrand(id, brandRequest, userContext);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in brand update endpoint: {}", e.getMessage(), e);
            
            ApiResponse<BrandResponse> errorResponse = ApiResponse.<BrandResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
                    
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * DELETE /api/product/brands/{id} - Delete brand
     * Requires user context and SELLER role
     */
    @DeleteMapping("/{id}")
    @RequireSeller
    public ResponseEntity<ApiResponse<Void>> deleteBrand(
            @PathVariable String id) {
        
        UserPayload userContext = UserContext.getUser();
        log.info("DELETE /api/product/brands/{} - Brand deletion request from user: {}", 
                id, userContext != null ? userContext.getEmail() : "unknown");
        
        try {
            ApiResponse<Void> response = brandService.deleteBrand(id, userContext);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in brand deletion endpoint: {}", e.getMessage(), e);
            
            ApiResponse<Void> errorResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
                    
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
