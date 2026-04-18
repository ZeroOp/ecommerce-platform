package com.redstore.product.service;

import com.redstore.common.dto.BrandCreatedEventData;
import com.redstore.common.dto.BrandStatusUpdatedEventData;
import com.redstore.common.dto.BrandUpdatedEventData;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.product.dto.BrandDto;
import com.redstore.product.dto.CreateBrandRequest;
import com.redstore.product.dto.UpdateBrandRequest;
import com.redstore.product.entity.Brand;
import com.redstore.product.entity.BrandStatus;
import com.redstore.product.entity.Category;
import com.redstore.product.events.publishers.BrandCreatedPublisher;
import com.redstore.product.events.publishers.BrandStatusUpdatedPublisher;
import com.redstore.product.events.publishers.BrandUpdatedPublisher;
import com.redstore.product.repository.BrandRepository;
import com.redstore.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final AuthContextService authContextService;
    private final BrandLogoUploadService brandLogoUploadService;
    private final BrandCreatedPublisher brandCreatedPublisher;
    private final BrandUpdatedPublisher brandUpdatedPublisher;
    private final BrandStatusUpdatedPublisher brandStatusUpdatedPublisher;

    public BrandService(
            BrandRepository brandRepository,
            CategoryRepository categoryRepository,
            AuthContextService authContextService,
            BrandLogoUploadService brandLogoUploadService,
            BrandCreatedPublisher brandCreatedPublisher,
            BrandUpdatedPublisher brandUpdatedPublisher,
            BrandStatusUpdatedPublisher brandStatusUpdatedPublisher
    ) {
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.authContextService = authContextService;
        this.brandLogoUploadService = brandLogoUploadService;
        this.brandCreatedPublisher = brandCreatedPublisher;
        this.brandUpdatedPublisher = brandUpdatedPublisher;
        this.brandStatusUpdatedPublisher = brandStatusUpdatedPublisher;
    }

    public List<BrandDto> listBrands(Set<String> categoryIds, String status) {
        BrandStatus brandStatus = parseStatusNullable(status);
        Set<String> categoryFilter = normalizeSet(categoryIds);
        return brandRepository.searchBrands(categoryFilter.isEmpty() ? null : categoryFilter, brandStatus)
                .stream()
                .map(this::toBrandDto)
                .toList();
    }

    public List<BrandDto> listBrandsBySeller(String sellerId) {
        return brandRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(this::toBrandDto)
                .toList();
    }

    @Transactional
    public BrandDto createBrand(CreateBrandRequest request) {
        String sellerId = authContextService.requireCurrentUserId();
        String name = request.name().trim();
        if (brandRepository.existsByName(name)) {
            throw new BadRequestException("Brand name must be unique");
        }

        Set<Category> categories = resolveCategories(request.categoryIds());

        Brand brand = Brand.builder()
                .id("brand-" + UUID.randomUUID())
                .name(name)
                .website(normalizeWebsite(request.website()))
                .description(request.description().trim())
                .sellerId(sellerId)
                .status(BrandStatus.PENDING)
                .logo(brandLogoUploadService.createReadUrl(blankToNull(request.logo())))
                .categories(categories)
                .build();

        Brand saved = brandRepository.save(brand);
        publishBrandCreated(saved);
        return toBrandDto(saved);
    }

    @Transactional
    public BrandDto updateBrand(String brandId, UpdateBrandRequest request) {
        String sellerId = authContextService.requireCurrentUserId();
        Brand brand = brandRepository.findByIdAndSellerId(brandId, sellerId)
                .orElseThrow(() -> new BadRequestException("Brand not found for seller"));

        String normalizedName = request.name().trim();
        if (!brand.getName().equalsIgnoreCase(normalizedName) && brandRepository.existsByName(normalizedName)) {
            throw new BadRequestException("Brand name must be unique");
        }

        brand.setName(normalizedName);
        brand.setWebsite(normalizeWebsite(request.website()));
        brand.setDescription(request.description().trim());
        brand.setLogo(brandLogoUploadService.createReadUrl(blankToNull(request.logo())));
        brand.setCategories(resolveCategories(request.categoryIds()));

        Brand saved = brandRepository.save(brand);
        publishBrandUpdated(saved);
        return toBrandDto(saved);
    }

    @Transactional
    public BrandDto updateBrandStatus(String brandId, String newStatus) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new BadRequestException("Brand not found"));

        BrandStatus status = parseStatus(newStatus);
        brand.setStatus(status);

        Brand saved = brandRepository.save(brand);
        brandStatusUpdatedPublisher.publish(
                BrandStatusUpdatedEventData.builder()
                        .brandId(saved.getId())
                        .sellerId(saved.getSellerId())
                        .status(saved.getStatus().name())
                        .updatedBy(authContextService.requireCurrentUserId())
                        .updatedAt(Instant.now())
                        .build()
        );
        return toBrandDto(saved);
    }

    private BrandDto toBrandDto(Brand brand) {
        return BrandDto.from(brand, brandLogoUploadService.createReadUrl(brand.getLogo()));
    }

    private Set<Category> resolveCategories(Set<String> categoryIds) {
        Set<String> normalizedIds = normalizeSet(categoryIds);
        if (normalizedIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Category> categories = categoryRepository.findAllById(normalizedIds);
        if (categories.size() != normalizedIds.size()) {
            throw new BadRequestException("One or more categoryIds are invalid");
        }
        return new HashSet<>(categories);
    }

    private Set<String> normalizeSet(Set<String> values) {
        if (values == null) return Set.of();
        return values.stream()
                .filter(v -> v != null && !v.isBlank())
                .map(String::trim)
                .collect(Collectors.toSet());
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeWebsite(String value) {
        if (value == null) return "";
        String trimmed = value.trim();
        return trimmed.isEmpty() ? "" : trimmed;
    }

    private BrandStatus parseStatus(String raw) {
        try {
            return BrandStatus.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid brand status: " + raw);
        }
    }

    private BrandStatus parseStatusNullable(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return parseStatus(raw);
    }

    private void publishBrandCreated(Brand brand) {
        brandCreatedPublisher.publish(
                BrandCreatedEventData.builder()
                        .brandId(brand.getId())
                        .sellerId(brand.getSellerId())
                        .name(brand.getName())
                        .website(brand.getWebsite())
                        .description(brand.getDescription())
                        .logo(brand.getLogo())
                        .status(brand.getStatus().name())
                        .categoryIds(brand.getCategories().stream().map(Category::getId).collect(Collectors.toSet()))
                        .createdAt(Instant.now())
                        .build()
        );
    }

    private void publishBrandUpdated(Brand brand) {
        brandUpdatedPublisher.publish(
                BrandUpdatedEventData.builder()
                        .brandId(brand.getId())
                        .sellerId(brand.getSellerId())
                        .name(brand.getName())
                        .website(brand.getWebsite())
                        .description(brand.getDescription())
                        .logo(brand.getLogo())
                        .status(brand.getStatus().name())
                        .categoryIds(brand.getCategories().stream().map(Category::getId).collect(Collectors.toSet()))
                        .updatedAt(Instant.now())
                        .build()
        );
    }
}
