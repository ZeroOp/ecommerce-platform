package com.redstore.product.repository;

import com.redstore.product.entity.Brand;
import com.redstore.product.entity.BrandStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class BrandRepositoryTest {

    @Autowired
    private BrandRepository brandRepository;

    private Brand testBrand1;
    private Brand testBrand2;
    private Brand testBrand3;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        brandRepository.deleteAll();
        
        // Create test brands
        Instant now = Instant.now();
        
        testBrand1 = Brand.builder()
                .id("brand-1")
                .name("Test Brand 1")
                .website("https://test1.com")
                .description("Description for test brand 1")
                .sellerId("seller-1")
                .contactPhone("+1234567890")
                .contactEmail("contact@test1.com")
                .status(BrandStatus.PENDING)
                .logo("https://test1.com/logo.png")
                .createdAt(now)
                .updatedAt(now)
                .build();
        
        testBrand2 = Brand.builder()
                .id("brand-2")
                .name("Test Brand 2")
                .website("https://test2.com")
                .description("Description for test brand 2")
                .sellerId("seller-1")
                .contactPhone("+0987654321")
                .contactEmail("contact@test2.com")
                .status(BrandStatus.APPROVED)
                .logo("https://test2.com/logo.png")
                .createdAt(now.minusSeconds(3600))
                .updatedAt(now.minusSeconds(3600))
                .build();
        
        testBrand3 = Brand.builder()
                .id("brand-3")
                .name("Another Brand")
                .website("https://test3.com")
                .description("Description for test brand 3")
                .sellerId("seller-2")
                .contactPhone("+1122334455")
                .contactEmail("contact@test3.com")
                .status(BrandStatus.PENDING)
                .logo("https://test3.com/logo.png")
                .createdAt(now.minusSeconds(7200))
                .updatedAt(now.minusSeconds(7200))
                .build();
        
        // Save test brands
        brandRepository.save(testBrand1);
        brandRepository.save(testBrand2);
        brandRepository.save(testBrand3);
    }

    @Test
    @DisplayName("Should find brands by seller ID ordered by creation date")
    void shouldFindBrandsBySellerIdOrderByCreatedAtDesc() {
        // When
        List<Brand> seller1Brands = brandRepository.findBySellerIdOrderByCreatedAtDesc("seller-1");
        
        // Then
        assertThat(seller1Brands).hasSize(2);
        assertThat(seller1Brands).extracting(Brand::getSellerId).containsOnly("seller-1");
        
        // Verify ordering - brands should be returned in descending order by creation date
        assertThat(seller1Brands).hasSize(2);
        
        // The first brand should be newer than the second brand
        Brand firstBrand = seller1Brands.get(0);
        Brand secondBrand = seller1Brands.get(1);
        
        assertThat(firstBrand.getCreatedAt()).isAfterOrEqualTo(secondBrand.getCreatedAt());
        
        // Verify both brands are present
        List<String> brandNames = seller1Brands.stream().map(Brand::getName).toList();
        assertThat(brandNames).contains("Test Brand 1", "Test Brand 2");
    }

    @Test
    @DisplayName("Should find brand by ID and seller ID")
    void shouldFindBrandByIdAndSellerId() {
        // When
        Optional<Brand> foundBrand = brandRepository.findByIdAndSellerId("brand-1", "seller-1");
        Optional<Brand> notFoundBrand = brandRepository.findByIdAndSellerId("brand-1", "seller-2");
        
        // Then
        assertThat(foundBrand).isPresent();
        assertThat(foundBrand.get().getName()).isEqualTo("Test Brand 1");
        assertThat(notFoundBrand).isEmpty();
    }

    @Test
    @DisplayName("Should check if brand name exists for specific seller")
    void shouldCheckBrandNameExistsForSeller() {
        // When
        boolean existsForSeller1 = brandRepository.existsByNameAndSellerId("Test Brand 1", "seller-1");
        boolean existsForSeller2 = brandRepository.existsByNameAndSellerId("Test Brand 1", "seller-2");
        boolean notExists = brandRepository.existsByNameAndSellerId("Non-existent Brand", "seller-1");
        
        // Then
        assertThat(existsForSeller1).isTrue();
        assertThat(existsForSeller2).isFalse();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should check if brand name exists globally")
    void shouldCheckBrandNameExistsGlobally() {
        // When
        boolean exists = brandRepository.existsByName("Test Brand 1");
        boolean notExists = brandRepository.existsByName("Non-existent Brand");
        
        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find brands by status")
    void shouldFindBrandsByStatus() {
        // When
        List<Brand> pendingBrands = brandRepository.findByStatus(BrandStatus.PENDING);
        List<Brand> approvedBrands = brandRepository.findByStatus(BrandStatus.APPROVED);
        List<Brand> rejectedBrands = brandRepository.findByStatus(BrandStatus.REJECTED);
        
        // Then
        assertThat(pendingBrands).hasSize(2);
        assertThat(approvedBrands).hasSize(1);
        assertThat(rejectedBrands).isEmpty();
        
        assertThat(pendingBrands).extracting(Brand::getStatus).containsOnly(BrandStatus.PENDING);
        assertThat(approvedBrands).extracting(Brand::getStatus).containsOnly(BrandStatus.APPROVED);
    }

    @Test
    @DisplayName("Should find brands by seller ID and status")
    void shouldFindBrandsBySellerIdAndStatus() {
        // When
        List<Brand> seller1Pending = brandRepository.findBySellerIdAndStatus("seller-1", BrandStatus.PENDING);
        List<Brand> seller1Approved = brandRepository.findBySellerIdAndStatus("seller-1", BrandStatus.APPROVED);
        List<Brand> seller2Pending = brandRepository.findBySellerIdAndStatus("seller-2", BrandStatus.PENDING);
        
        // Then
        assertThat(seller1Pending).hasSize(1);
        assertThat(seller1Approved).hasSize(1);
        assertThat(seller2Pending).hasSize(1);
        
        assertThat(seller1Pending.get(0).getName()).isEqualTo("Test Brand 1");
        assertThat(seller1Approved.get(0).getName()).isEqualTo("Test Brand 2");
        assertThat(seller2Pending.get(0).getName()).isEqualTo("Another Brand");
    }

    @Test
    @DisplayName("Should count brands by seller ID")
    void shouldCountBrandsBySellerId() {
        // When
        long seller1Count = brandRepository.countBySellerId("seller-1");
        long seller2Count = brandRepository.countBySellerId("seller-2");
        long seller3Count = brandRepository.countBySellerId("seller-3");
        
        // Then
        assertThat(seller1Count).isEqualTo(2);
        assertThat(seller2Count).isEqualTo(1);
        assertThat(seller3Count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should find brands by name containing text (case insensitive)")
    void shouldFindBrandsByNameContainingIgnoreCase() {
        // When
        List<Brand> testBrands = brandRepository.findByNameContainingIgnoreCase("test");
        List<Brand> anotherBrands = brandRepository.findByNameContainingIgnoreCase("another");
        List<Brand> brandBrands = brandRepository.findByNameContainingIgnoreCase("brand");
        List<Brand> nonExistent = brandRepository.findByNameContainingIgnoreCase("xyz");
        
        // Then
        assertThat(testBrands).hasSize(2);
        assertThat(anotherBrands).hasSize(1);
        assertThat(brandBrands).hasSize(3); // All contain "brand"
        assertThat(nonExistent).isEmpty();
    }

    @Test
    @DisplayName("Should find approved brands ordered by creation date")
    void shouldFindApprovedBrandsOrderedByCreatedAtDesc() {
        // When
        List<Brand> approvedBrands = brandRepository.findByStatusOrderByCreatedAtDesc(BrandStatus.APPROVED);
        
        // Then
        assertThat(approvedBrands).hasSize(1);
        assertThat(approvedBrands.get(0).getName()).isEqualTo("Test Brand 2");
        assertThat(approvedBrands.get(0).getStatus()).isEqualTo(BrandStatus.APPROVED);
    }

    @Test
    @DisplayName("Should save and retrieve brand with all fields")
    void shouldSaveAndRetrieveBrandWithAllFields() {
        // Given
        Instant now = Instant.now();
        Brand newBrand = Brand.builder()
                .id("brand-new")
                .name("New Test Brand")
                .website("https://newbrand.com")
                .description("New brand description")
                .sellerId("seller-new")
                .contactPhone("+9999999999")
                .contactEmail("new@brand.com")
                .status(BrandStatus.PENDING)
                .logo("https://newbrand.com/logo.png")
                .createdAt(now)
                .updatedAt(now)
                .build();
        
        // When
        Brand savedBrand = brandRepository.save(newBrand);
        Optional<Brand> retrievedBrand = brandRepository.findById("brand-new");
        
        // Then
        assertThat(savedBrand).isNotNull();
        assertThat(savedBrand.getId()).isEqualTo("brand-new");
        assertThat(savedBrand.getName()).isEqualTo("New Test Brand");
        assertThat(savedBrand.getWebsite()).isEqualTo("https://newbrand.com");
        assertThat(savedBrand.getDescription()).isEqualTo("New brand description");
        assertThat(savedBrand.getSellerId()).isEqualTo("seller-new");
        assertThat(savedBrand.getContactPhone()).isEqualTo("+9999999999");
        assertThat(savedBrand.getContactEmail()).isEqualTo("new@brand.com");
        assertThat(savedBrand.getStatus()).isEqualTo(BrandStatus.PENDING);
        assertThat(savedBrand.getLogo()).isEqualTo("https://newbrand.com/logo.png");
        assertThat(savedBrand.getCreatedAt()).isNotNull();
        assertThat(savedBrand.getUpdatedAt()).isNotNull();
        
        assertThat(retrievedBrand).isPresent();
        assertThat(retrievedBrand.get()).isEqualTo(savedBrand);
    }

    @Test
    @DisplayName("Should delete brand successfully")
    void shouldDeleteBrandSuccessfully() {
        // Given
        assertThat(brandRepository.existsById("brand-1")).isTrue();
        
        // When
        brandRepository.deleteById("brand-1");
        
        // Then
        assertThat(brandRepository.existsById("brand-1")).isFalse();
        assertThat(brandRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should handle null website field")
    void shouldHandleNullWebsiteField() {
        // Given
        Brand brandWithoutWebsite = Brand.builder()
                .id("brand-no-website")
                .name("Brand No Website")
                .website(null)
                .description("Description")
                .sellerId("seller-1")
                .status(BrandStatus.PENDING)
                .build();
        
        // When
        Brand savedBrand = brandRepository.save(brandWithoutWebsite);
        
        // Then
        assertThat(savedBrand.getWebsite()).isNull();
        assertThat(brandRepository.findById("brand-no-website")).isPresent();
    }
}
