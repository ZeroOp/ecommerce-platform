package com.redstore.product.controller;

import com.redstore.common.annotations.RequireAdmin;
import com.redstore.product.dto.CategoryDto;
import com.redstore.product.dto.CreateCategoryIconUploadUrlRequest;
import com.redstore.product.dto.CreateCategoryRequest;
import com.redstore.product.dto.PresignedUploadUrlResponse;
import com.redstore.product.service.AuthContextService;
import com.redstore.product.service.CategoryIconUploadService;
import com.redstore.product.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryIconUploadService categoryIconUploadService;
    private final AuthContextService authContextService;

    public CategoryController(
            CategoryService categoryService,
            CategoryIconUploadService categoryIconUploadService,
            AuthContextService authContextService
    ) {
        this.categoryService = categoryService;
        this.categoryIconUploadService = categoryIconUploadService;
        this.authContextService = authContextService;
    }

    @GetMapping
    public List<CategoryDto> getAllCategories() {
        return categoryService.listCategories();
    }

    @PostMapping
    @RequireAdmin
    public CategoryDto createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PostMapping("/icon/presigned-upload")
    @RequireAdmin
    public PresignedUploadUrlResponse createIconUploadUrl(
            @Valid @RequestBody CreateCategoryIconUploadUrlRequest request
    ) {
        // Use admin ID as the identifier for category icon uploads
        String adminId = authContextService.requireCurrentUserId();
        return categoryIconUploadService.createUploadUrl(adminId, request.fileName(), request.contentType());
    }
}
