package com.redstore.product.service;

import com.redstore.common.dto.UserPayload;
import com.redstore.product.dto.BrandRequest;
import com.redstore.product.dto.BrandResponse;
import com.redstore.product.dto.ApiResponse;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.product.entity.Brand;
import com.redstore.product.entity.BrandStatus;
import com.redstore.product.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandService {

    private final BrandRepository brandRepository;

    /**
     * Create a new brand with user context validation
     */
    public ApiResponse<BrandResponse> createBrand(BrandRequest brandRequest, UserPayload userContext) {
        log.info("Creating brand: {} by user: {}", brandRequest.getName(), userContext.getEmail());
        
        // Validate user context (role validation is handled by @RequireSeller annotation)
        validateUserContext(userContext);
        
        try {
            // Check if brand already exists for this seller
            if (brandRepository.existsByNameAndSellerId(brandRequest.getName(), userContext.getId())) {
                return ApiResponse.<BrandResponse>builder()
                        .success(false)
                        .message("Brand with name '" + brandRequest.getName() + "' already exists")
                        .build();
            }
            
            // Create brand entity
            Brand brand = Brand.builder()
                    .id(UUID.randomUUID().toString())
                    .name(brandRequest.getName())
                    .website(brandRequest.getWebsite())
                    .description(brandRequest.getDescription())
                    .sellerId(userContext.getId())
                    .status(BrandStatus.PENDING) // All new brands start as PENDING
                    .createdAt(java.time.Instant.now())
                    .updatedAt(java.time.Instant.now())
                    .build();
            
            // Handle logo upload if provided
            if (brandRequest.getLogo() != null && !brandRequest.getLogo().isEmpty()) {
                String logoUrl = processLogoUpload(brandRequest.getLogo(), brand.getId());
                brand.setLogo(logoUrl);
            }
            
            // Save brand
            Brand savedBrand = brandRepository.save(brand);
            
            // Publish brand registration event
            publishBrandRegistrationEvent(savedBrand, userContext);
            
            log.info("Brand created successfully: {} with ID: {}", savedBrand.getName(), savedBrand.getId());
            
            return ApiResponse.<BrandResponse>builder()
                    .success(true)
                    .data(convertToResponse(savedBrand))
                    .message("Brand submitted for approval successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error creating brand: {}", e.getMessage(), e);
            return ApiResponse.<BrandResponse>builder()
                    .success(false)
                    .message("Failed to create brand: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all brands for the current seller
     */
    public ApiResponse<List<BrandResponse>> getBrands(UserPayload userContext) {
        log.info("Fetching brands for user: {}", userContext.getEmail());
        
        // Validate user context (role validation is handled by @RequireSeller annotation)
        validateUserContext(userContext);
        
        try {
            List<Brand> brands = brandRepository.findBySellerIdOrderByCreatedAtDesc(userContext.getId());
            List<BrandResponse> brandResponses = brands.stream()
                    .map(this::convertToResponse)
                    .toList();
            
            return ApiResponse.<List<BrandResponse>>builder()
                    .success(true)
                    .data(brandResponses)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error fetching brands: {}", e.getMessage(), e);
            return ApiResponse.<List<BrandResponse>>builder()
                    .success(false)
                    .message("Failed to fetch brands: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update an existing brand
     */
    public ApiResponse<BrandResponse> updateBrand(String brandId, BrandRequest brandRequest, UserPayload userContext) {
        log.info("Updating brand: {} by user: {}", brandId, userContext.getEmail());
        
        // Validate user context (role validation is handled by @RequireSeller annotation)
        validateUserContext(userContext);
        
        try {
            Brand existingBrand = brandRepository.findByIdAndSellerId(brandId, userContext.getId())
                    .orElse(null);
            
            if (existingBrand == null) {
                return ApiResponse.<BrandResponse>builder()
                        .success(false)
                        .message("Brand not found or access denied")
                        .build();
            }
            
            // Update brand details
            existingBrand.setName(brandRequest.getName());
            existingBrand.setWebsite(brandRequest.getWebsite());
            existingBrand.setDescription(brandRequest.getDescription());
            existingBrand.setUpdatedAt(java.time.Instant.now());
            
            // Handle logo update if provided
            if (brandRequest.getLogo() != null && !brandRequest.getLogo().isEmpty()) {
                String logoUrl = processLogoUpload(brandRequest.getLogo(), existingBrand.getId());
                existingBrand.setLogo(logoUrl);
            }
            
            Brand updatedBrand = brandRepository.save(existingBrand);
            
            log.info("Brand updated successfully: {}", updatedBrand.getName());
            
            return ApiResponse.<BrandResponse>builder()
                    .success(true)
                    .data(convertToResponse(updatedBrand))
                    .message("Brand updated successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error updating brand: {}", e.getMessage(), e);
            return ApiResponse.<BrandResponse>builder()
                    .success(false)
                    .message("Failed to update brand: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete a brand
     */
    public ApiResponse<Void> deleteBrand(String brandId, UserPayload userContext) {
        log.info("Deleting brand: {} by user: {}", brandId, userContext.getEmail());
        
        // Validate user context (role validation is handled by @RequireSeller annotation)
        validateUserContext(userContext);
        
        try {
            Brand existingBrand = brandRepository.findByIdAndSellerId(brandId, userContext.getId())
                    .orElse(null);
            
            if (existingBrand == null) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Brand not found or access denied")
                        .build();
            }
            
            brandRepository.delete(existingBrand);
            
            log.info("Brand deleted successfully: {}", existingBrand.getName());
            
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Brand deleted successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error deleting brand: {}", e.getMessage(), e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Failed to delete brand: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Validate user context
     */
    private void validateUserContext(UserPayload userContext) {
        if (userContext == null) {
            throw new NotAuthorizedException();
        }
        
        if (userContext.getId() == null || userContext.getId().trim().isEmpty()) {
            throw new NotAuthorizedException();
        }
        
        if (userContext.getEmail() == null || userContext.getEmail().trim().isEmpty()) {
            throw new NotAuthorizedException();
        }
    }

    
    /**
     * Process logo upload and return URL
     */
    private String processLogoUpload(MultipartFile logoFile, String brandId) {
        // Validate file
        if (logoFile.isEmpty()) {
            return null;
        }
        
        // Validate file size (5MB max)
        if (logoFile.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Logo file size cannot exceed 5MB");
        }
        
        // Validate file type
        String contentType = logoFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed for logo");
        }
        
        try {
            // Generate unique filename
            String originalFilename = logoFile.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String uniqueFilename = "brand-" + brandId + "-" + System.currentTimeMillis() + fileExtension;
            
            // TODO: Implement actual file upload to cloud storage (S3, etc.)
            // For now, return a mock URL
            String logoUrl = "/api/files/brand-logos/" + uniqueFilename;
            
            log.info("Logo uploaded successfully: {}", logoUrl);
            return logoUrl;
            
        } catch (Exception e) {
            log.error("Error processing logo upload: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process logo upload: " + e.getMessage());
        }
    }

    /**
     * Convert Brand entity to BrandResponse DTO
     */
    private BrandResponse convertToResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .website(brand.getWebsite())
                .logo(brand.getLogo())
                .description(brand.getDescription())
                .status(brand.getStatus())
                .registrationDate(brand.getCreatedAt().toString())
                .createdAt(brand.getCreatedAt().toString())
                .updatedAt(brand.getUpdatedAt().toString())
                .build();
    }

    /**
     * Publish brand registration event
     */
    private void publishBrandRegistrationEvent(Brand brand, UserPayload userContext) {
        // TODO: Implement event publishing to NATS/message broker
        log.info("Publishing brand registration event for brand: {} by user: {}", 
                brand.getName(), userContext.getEmail());
    }
}
