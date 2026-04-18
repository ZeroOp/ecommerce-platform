package com.redstore.cart.catalog;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.common.dto.ProductCreatedEventData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

/**
 * Read-through cache for the product catalog replica. Look-ups go:
 * <ol>
 *   <li>Redis (cart-redis cluster, under a dedicated key prefix),</li>
 *   <li>Postgres (populated by the NATS consumer).</li>
 * </ol>
 * Writes (from the NATS consumer) upsert into both stores.
 */
@Slf4j
@Service
public class ProductCatalogService {

    private final ProductCatalogRepository repository;
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    @Value("${product-cache.key-prefix}")
    private String keyPrefix;

    @Value("${product-cache.ttl-seconds}")
    private long ttlSeconds;

    public ProductCatalogService(
            ProductCatalogRepository repository,
            StringRedisTemplate redis,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    public Optional<ProductCatalogDto> find(String productId) {
        if (productId == null || productId.isBlank()) {
            return Optional.empty();
        }
        String cacheKey = cacheKey(productId);
        try {
            String cached = redis.opsForValue().get(cacheKey);
            if (cached != null) {
                return Optional.of(objectMapper.readValue(cached, ProductCatalogDto.class));
            }
        } catch (Exception e) {
            log.warn("cart-service: product cache read failed for {}: {}", productId, e.getMessage());
        }
        Optional<ProductCatalogEntry> fromDb = repository.findById(productId);
        fromDb.map(ProductCatalogDto::from).ifPresent(dto -> writeCache(cacheKey, dto));
        return fromDb.map(ProductCatalogDto::from);
    }

    public void upsertFromCreatedEvent(ProductCreatedEventData event) {
        if (event == null || event.getProductId() == null) {
            return;
        }
        ProductCatalogEntry entry = repository.findById(event.getProductId())
                .orElseGet(ProductCatalogEntry::new);
        entry.setProductId(event.getProductId());
        entry.setSellerId(event.getSellerId());
        entry.setBrandId(event.getBrandId());
        entry.setBrandName(event.getBrandName());
        entry.setCategoryId(event.getCategoryId());
        entry.setName(event.getName());
        entry.setSlug(event.getSlug());
        entry.setPrice(event.getPrice());
        entry.setImageUrlsCsv(toCsv(event.getImageUrls()));
        entry.setReceivedAt(Instant.now());
        repository.save(entry);
        writeCache(cacheKey(entry.getProductId()), ProductCatalogDto.from(entry));
        log.debug("cart-service: catalog upserted {}", entry.getProductId());
    }

    private static String toCsv(java.util.List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return String.join(",", values.stream().filter(v -> v != null && !v.isBlank()).toList());
    }

    private void writeCache(String key, ProductCatalogDto dto) {
        if (dto == null) return;
        try {
            redis.opsForValue().set(key, objectMapper.writeValueAsString(dto), Duration.ofSeconds(ttlSeconds));
        } catch (JsonProcessingException e) {
            log.warn("cart-service: product cache write failed: {}", e.getMessage());
        }
    }

    private String cacheKey(String productId) {
        // Braces pin the key to a single cluster slot — no cross-slot hazard when
        // the cart hash and the product cache happen to be on the same user.
        return keyPrefix + "{" + productId + "}";
    }
}
