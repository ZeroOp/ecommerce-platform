package com.redstore.product.service;

import com.redstore.common.dto.CategoryCreatedEventData;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.product.dto.CategoryDto;
import com.redstore.product.dto.CreateCategoryRequest;
import com.redstore.product.entity.Category;
import com.redstore.product.events.publishers.CategoryCreatedPublisher;
import com.redstore.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuthContextService authContextService;
    private final CategoryCreatedPublisher categoryCreatedPublisher;

    public CategoryService(
            CategoryRepository categoryRepository,
            AuthContextService authContextService,
            CategoryCreatedPublisher categoryCreatedPublisher
    ) {
        this.categoryRepository = categoryRepository;
        this.authContextService = authContextService;
        this.categoryCreatedPublisher = categoryCreatedPublisher;
    }

    public List<CategoryDto> listCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryDto::from)
                .toList();
    }

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        String normalizedName = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new BadRequestException("Category name already exists");
        }

        if (request.parentCategoryId() != null && !request.parentCategoryId().isBlank()
                && categoryRepository.findById(request.parentCategoryId()).isEmpty()) {
            throw new BadRequestException("Parent category does not exist");
        }

        String slug = request.slug() == null || request.slug().isBlank()
                ? toSlug(normalizedName)
                : toSlug(request.slug());
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category slug already exists");
        }

        Category category = Category.builder()
                .id("cat-" + UUID.randomUUID())
                .name(normalizedName)
                .slug(slug)
                .description(request.description())
                .icon(request.icon())
                .parentCategoryId(blankToNull(request.parentCategoryId()))
                .build();

        Category saved = categoryRepository.save(category);

        categoryCreatedPublisher.publish(
                CategoryCreatedEventData.builder()
                        .categoryId(saved.getId())
                        .name(saved.getName())
                        .slug(saved.getSlug())
                        .parentCategoryId(saved.getParentCategoryId())
                        .createdBy(authContextService.requireCurrentUserId())
                        .createdAt(Instant.now())
                        .build()
        );

        return CategoryDto.from(saved);
    }

    private String toSlug(String raw) {
        return raw
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
