package com.redstore.product.service;

import com.redstore.common.dto.ProductCreatedEventData;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.utils.UserContext;
import com.redstore.product.dto.CreateProductRequest;
import com.redstore.product.dto.MetadataFieldDefinition;
import com.redstore.product.dto.ProductDto;
import com.redstore.product.entity.Brand;
import com.redstore.product.entity.BrandStatus;
import com.redstore.product.entity.Category;
import com.redstore.product.entity.Product;
import com.redstore.product.events.publishers.ProductCreatedPublisher;
import com.redstore.product.repository.BrandRepository;
import com.redstore.product.repository.CategoryRepository;
import com.redstore.product.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final AuthContextService authContextService;
    private final CategoryMetadataTemplateService categoryMetadataTemplateService;
    private final ProductImageUploadService productImageUploadService;
    private final ProductCreatedPublisher productCreatedPublisher;

    public ProductService(
            ProductRepository productRepository,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository,
            AuthContextService authContextService,
            CategoryMetadataTemplateService categoryMetadataTemplateService,
            ProductImageUploadService productImageUploadService,
            ProductCreatedPublisher productCreatedPublisher
    ) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.authContextService = authContextService;
        this.categoryMetadataTemplateService = categoryMetadataTemplateService;
        this.productImageUploadService = productImageUploadService;
        this.productCreatedPublisher = productCreatedPublisher;
    }

    public List<ProductDto> listStorefront(String categoryId, String categorySlug, int limit) {
        String resolvedCategoryId = blankToNull(categoryId);
        if (resolvedCategoryId == null && categorySlug != null && !categorySlug.isBlank()) {
            resolvedCategoryId = categoryRepository.findBySlug(categorySlug.trim())
                    .map(Category::getId)
                    .orElse(null);
            if (resolvedCategoryId == null) {
                return List.of();
            }
        }
        int safeLimit = Math.min(Math.max(limit, 1), 96);
        List<Product> products;
        if (resolvedCategoryId == null) {
            products = productRepository.findPublishedForStorefrontAll(
                    BrandStatus.APPROVED,
                    PageRequest.of(0, safeLimit)
            );
        } else {
            List<String> categoryScope = categoryIdsIncludingDescendants(resolvedCategoryId);
            if (categoryScope.isEmpty()) {
                return List.of();
            }
            products = productRepository.findPublishedForStorefrontInCategories(
                    BrandStatus.APPROVED,
                    categoryScope,
                    PageRequest.of(0, safeLimit)
            );
        }
        return products.stream().map(this::toDto).toList();
    }

    /**
     * Hydrate storefront DTOs by id (e.g. search hits) with presigned image URLs.
     * Preserves request order; skips unknown or non-published products.
     */
    public List<ProductDto> listStorefrontByProductIds(List<String> productIds, int limit) {
        if (productIds == null || productIds.isEmpty()) {
            return List.of();
        }
        int safeLimit = Math.min(Math.max(limit, 1), 96);
        List<String> ids = productIds.stream().filter(Objects::nonNull).map(String::trim)
                .filter(s -> !s.isEmpty()).distinct().limit(safeLimit).toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<String, Product> byId = productRepository.findAllById(ids).stream()
                .filter(this::isPublishedApprovedBrand)
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a, LinkedHashMap::new));
        return ids.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(this::toDto)
                .toList();
    }

    private boolean isPublishedApprovedBrand(Product product) {
        return brandRepository.findById(product.getBrandId())
                .map(b -> b.getStatus() == BrandStatus.APPROVED)
                .orElse(false);
    }

    /**
     * Category page should include products in this category and every child category.
     */
    private List<String> categoryIdsIncludingDescendants(String rootCategoryId) {
        List<String> out = new ArrayList<>();
        Deque<String> q = new ArrayDeque<>();
        q.add(rootCategoryId);
        while (!q.isEmpty()) {
            String id = q.remove();
            out.add(id);
            for (Category child : categoryRepository.findByParentCategoryIdOrderByNameAsc(id)) {
                q.add(child.getId());
            }
        }
        return out;
    }

    public ProductDto getById(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found"));
        Brand brand = brandRepository.findById(product.getBrandId())
                .orElseThrow(() -> new BadRequestException("Product not found"));

        UserPayload user = UserContext.getUser();
        boolean owner = user != null && product.getSellerId().equals(user.getId());
        if (brand.getStatus() != BrandStatus.APPROVED && !owner) {
            throw new BadRequestException("Product not found");
        }
        return toDto(product);
    }

    public List<ProductDto> listMine() {
        String sellerId = authContextService.requireCurrentUserId();
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> listAll() {
        return productRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt"
                )
        ).stream().map(this::toDto).toList();
    }

    /**
     * Seller-scoped lookup (e.g. inventory service validating ownership).
     */
    public ProductDto getByIdForSeller(String sellerId, String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found"));
        if (!product.getSellerId().equals(sellerId)) {
            throw new BadRequestException("Product not found");
        }
        return toDto(product);
    }

    @Transactional
    public ProductDto create(CreateProductRequest request) {
        authContextService.requireActiveSellerAccount();
        String sellerId = authContextService.requireCurrentUserId();
        Brand brand = brandRepository.findByIdAndSellerId(request.brandId(), sellerId)
                .orElseThrow(() -> new BadRequestException("Brand not found for seller"));

        if (brand.getStatus() != BrandStatus.APPROVED) {
            throw new BadRequestException("Only approved brands can list products");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BadRequestException("Category not found"));

        boolean categoryLinkedToBrand = brand.getCategories().stream()
                .anyMatch(c -> c.getId().equals(category.getId()));
        if (!categoryLinkedToBrand) {
            brand.getCategories().add(category);
            brandRepository.save(brand);
        }

        List<MetadataFieldDefinition> template = categoryMetadataTemplateService.resolveTemplate(category);
        validateMetadata(template, request.metadata());

        List<String> keys = new ArrayList<>(request.imageKeys());
        if (keys.size() < 3 || keys.size() > 6) {
            throw new BadRequestException("Provide between 3 and 6 product images");
        }
        for (String k : keys) {
            if (k == null || k.isBlank()) {
                throw new BadRequestException("Image keys cannot be blank");
            }
        }

        // Convert object keys (returned by the presigned-upload flow) into
        // the stable, publicly-readable URLs we persist and hand out from
        // here on. We never store raw keys in the DB anymore.
        List<String> imageUrls = keys.stream()
                .map(String::trim)
                .map(productImageUploadService::createReadUrl)
                .toList();

        String slug = uniqueSlug(toSlug(request.name()));

        Product product = Product.builder()
                .id("prd-" + UUID.randomUUID())
                .sellerId(sellerId)
                .brandId(brand.getId())
                .categoryId(category.getId())
                .name(request.name().trim())
                .slug(slug)
                .description(request.description().trim())
                .price(request.price().stripTrailingZeros())
                .imageUrls(imageUrls)
                .metadata(normalizeMetadata(request.metadata()))
                .build();

        Product saved = productRepository.save(product);

        productCreatedPublisher.publish(
                ProductCreatedEventData.builder()
                        .productId(saved.getId())
                        .sellerId(saved.getSellerId())
                        .brandId(saved.getBrandId())
                        .brandName(brand.getName())
                        .categoryId(saved.getCategoryId())
                        .categorySlug(category.getSlug())
                        .categoryName(category.getName())
                        .name(saved.getName())
                        .slug(saved.getSlug())
                        .description(saved.getDescription())
                        .price(saved.getPrice())
                        .imageUrls(new ArrayList<>(saved.getImageUrls()))
                        .metadata(saved.getMetadata())
                        .createdAt(saved.getCreatedAt() != null ? saved.getCreatedAt() : Instant.now())
                        .build()
        );

        return toDto(saved);
    }

    private void validateMetadata(List<MetadataFieldDefinition> template, Map<String, String> metadata) {
        Set<String> expected = template.stream()
                .map(MetadataFieldDefinition::key)
                .collect(Collectors.toCollection(HashSet::new));
        Set<String> actual = metadata.keySet();
        if (!expected.equals(actual)) {
            throw new BadRequestException(
                    "Metadata keys must match this category's template. Expected: " + expected
            );
        }
        for (String k : expected) {
            String v = metadata.get(k);
            if (v == null || v.isBlank()) {
                throw new BadRequestException("Metadata value for '" + k + "' is required");
            }
        }
    }

    private Map<String, String> normalizeMetadata(Map<String, String> metadata) {
        return metadata.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().trim(),
                        e -> e.getValue().trim()
                ));
    }

    private ProductDto toDto(Product product) {
        String brandName = brandRepository.findById(product.getBrandId())
                .map(Brand::getName)
                .orElse("");

        Category category = categoryRepository.findById(product.getCategoryId()).orElse(null);
        String categoryName = category != null ? category.getName() : "";
        String categorySlug = category != null ? category.getSlug() : "";

        // Entities already carry absolute URLs; we still funnel them through
        // createReadUrl so any legacy rows (raw keys) are transparently
        // upgraded to absolute URLs for the response.
        List<String> urls = product.getImageUrls().stream()
                .map(productImageUploadService::createReadUrl)
                .toList();

        return new ProductDto(
                product.getId(),
                product.getSellerId(),
                product.getBrandId(),
                brandName,
                product.getCategoryId(),
                categorySlug,
                categoryName,
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                urls,
                product.getMetadata(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private String uniqueSlug(String base) {
        String candidate = base;
        int guard = 0;
        while (productRepository.findBySlug(candidate).isPresent() && guard++ < 40) {
            candidate = base + "-" + UUID.randomUUID().toString().substring(0, 8).toLowerCase(Locale.ROOT);
        }
        if (productRepository.findBySlug(candidate).isPresent()) {
            candidate = base + "-" + UUID.randomUUID();
        }
        return candidate;
    }

    private String toSlug(String raw) {
        return raw
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
