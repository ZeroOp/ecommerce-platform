package com.redstore.cart.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Lightweight projection of a product that cart-service owns a copy of so it
 * can answer the question <em>does this product exist and is it sellable?</em>
 * without calling product-service on every add-to-cart. Rows are filled in by
 * the NATS consumer and refreshed whenever newer events arrive.
 *
 * <p>{@code imageUrlsCsv} stores a simple comma-separated list of fully
 * qualified, publicly-readable image URLs — cart-service hands them back
 * verbatim, never serving bytes.</p>
 */
@Entity
@Table(name = "product_catalog")
public class ProductCatalogEntry {

    @Id
    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "seller_id")
    private String sellerId;

    @Column(name = "brand_id")
    private String brandId;

    @Column(name = "brand_name", length = 256)
    private String brandName;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "name", length = 512)
    private String name;

    @Column(name = "slug", length = 512)
    private String slug;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    /** Comma-separated absolute image URLs (order preserved). */
    @Column(name = "image_urls_csv", length = 4096)
    private String imageUrlsCsv;

    @Column(name = "received_at")
    private Instant receivedAt;

    public ProductCatalogEntry() {}

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getBrandId() { return brandId; }
    public void setBrandId(String brandId) { this.brandId = brandId; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getImageUrlsCsv() { return imageUrlsCsv; }
    public void setImageUrlsCsv(String imageUrlsCsv) { this.imageUrlsCsv = imageUrlsCsv; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
}
