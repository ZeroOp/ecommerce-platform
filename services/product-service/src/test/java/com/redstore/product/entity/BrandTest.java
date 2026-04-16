package com.redstore.product.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

public class BrandTest {

    private Brand brand;

    @BeforeEach
    public void setUp() {
        brand = Brand.builder()
                .id("test-brand")
                .name("Test Brand")
                .website("https://testbrand.com")
                .description("Test description")
                .sellerId("seller-123")
                .contactPhone("+1234567890")
                .contactEmail("contact@testbrand.com")
                .status(BrandStatus.PENDING)
                .logo("https://testbrand.com/logo.png")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should create brand with builder")
    public void shouldCreateBrandWithBuilder() {
        // Then
        assertThat(brand.getId()).isEqualTo("test-brand");
        assertThat(brand.getName()).isEqualTo("Test Brand");
        assertThat(brand.getWebsite()).isEqualTo("https://testbrand.com");
        assertThat(brand.getDescription()).isEqualTo("Test description");
        assertThat(brand.getSellerId()).isEqualTo("seller-123");
        assertThat(brand.getContactPhone()).isEqualTo("+1234567890");
        assertThat(brand.getContactEmail()).isEqualTo("contact@testbrand.com");
        assertThat(brand.getStatus()).isEqualTo(BrandStatus.PENDING);
        assertThat(brand.getLogo()).isEqualTo("https://testbrand.com/logo.png");
        assertThat(brand.getCreatedAt()).isNotNull();
        assertThat(brand.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should handle null website")
    void shouldHandleNullWebsite() {
        // Given
        Brand brandWithoutWebsite = Brand.builder()
                .id("brand-no-website")
                .name("Brand No Website")
                .website(null)
                .description("Description")
                .sellerId("seller-123")
                .status(BrandStatus.PENDING)
                .build();
        
        // Then
        assertThat(brandWithoutWebsite.getWebsite()).isNull();
        assertThat(brandWithoutWebsite.getName()).isEqualTo("Brand No Website");
    }

    @Test
    @DisplayName("Should handle all brand statuses")
    void shouldHandleAllBrandStatuses() {
        // Given
        Brand pendingBrand = brand.toBuilder().status(BrandStatus.PENDING).build();
        Brand approvedBrand = brand.toBuilder().status(BrandStatus.APPROVED).build();
        Brand rejectedBrand = brand.toBuilder().status(BrandStatus.REJECTED).build();
        Brand suspendedBrand = brand.toBuilder().status(BrandStatus.SUSPENDED).build();
        
        // Then
        assertThat(pendingBrand.getStatus()).isEqualTo(BrandStatus.PENDING);
        assertThat(approvedBrand.getStatus()).isEqualTo(BrandStatus.APPROVED);
        assertThat(rejectedBrand.getStatus()).isEqualTo(BrandStatus.REJECTED);
        assertThat(suspendedBrand.getStatus()).isEqualTo(BrandStatus.SUSPENDED);
    }

    @Test
    @DisplayName("Should update brand using builder")
    void shouldUpdateBrandUsingBuilder() {
        // When
        Brand updatedBrand = brand.toBuilder()
                .name("Updated Brand Name")
                .website("https://updated.com")
                .status(BrandStatus.APPROVED)
                .build();
        
        // Then
        assertThat(updatedBrand.getId()).isEqualTo("test-brand"); // Unchanged
        assertThat(updatedBrand.getName()).isEqualTo("Updated Brand Name");
        assertThat(updatedBrand.getWebsite()).isEqualTo("https://updated.com");
        assertThat(updatedBrand.getStatus()).isEqualTo(BrandStatus.APPROVED);
        assertThat(updatedBrand.getSellerId()).isEqualTo("seller-123"); // Unchanged
    }

    @Test
    @DisplayName("Should handle empty contact details")
    void shouldHandleEmptyContactDetails() {
        // Given
        Brand brandWithoutContact = Brand.builder()
                .id("brand-no-contact")
                .name("Brand No Contact")
                .description("Description")
                .sellerId("seller-123")
                .contactPhone(null)
                .contactEmail(null)
                .status(BrandStatus.PENDING)
                .build();
        
        // Then
        assertThat(brandWithoutContact.getContactPhone()).isNull();
        assertThat(brandWithoutContact.getContactEmail()).isNull();
    }

    @Test
    @DisplayName("Should create brand with minimal required fields")
    void shouldCreateBrandWithMinimalRequiredFields() {
        // Given
        Brand minimalBrand = Brand.builder()
                .id("minimal-brand")
                .name("Minimal Brand")
                .description("Minimal description")
                .sellerId("seller-123")
                .status(BrandStatus.PENDING)
                .build();
        
        // Then
        assertThat(minimalBrand.getId()).isEqualTo("minimal-brand");
        assertThat(minimalBrand.getName()).isEqualTo("Minimal Brand");
        assertThat(minimalBrand.getDescription()).isEqualTo("Minimal description");
        assertThat(minimalBrand.getSellerId()).isEqualTo("seller-123");
        assertThat(minimalBrand.getStatus()).isEqualTo(BrandStatus.PENDING);
        assertThat(minimalBrand.getWebsite()).isNull();
        assertThat(minimalBrand.getContactPhone()).isNull();
        assertThat(minimalBrand.getContactEmail()).isNull();
        assertThat(minimalBrand.getLogo()).isNull();
    }

    @Test
    @DisplayName("Should test equals and hashCode")
    void shouldTestEqualsAndHashCode() {
        // Given
        Brand identicalBrand = brand.toBuilder().build();
        Brand differentBrand = brand.toBuilder().name("Different Name").build();
        
        // Then
        assertThat(brand).isEqualTo(identicalBrand);
        assertThat(brand.hashCode()).isEqualTo(identicalBrand.hashCode());
        assertThat(brand).isNotEqualTo(differentBrand);
    }
}
