package com.redstore.inventory.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class InventoryCacheService {

    private final StringRedisTemplate redis;

    @Value("${inventory.cache.key-prefix}")
    private String keyPrefix;

    @Value("${inventory.cache.ttl-seconds}")
    private long ttlSeconds;

    public InventoryCacheService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public Optional<Integer> getCachedQuantity(String productId) {
        String raw = redis.opsForValue().get(keyPrefix + productId);
        if (raw == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(Integer.parseInt(raw));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public void cacheQuantity(String productId, int quantity) {
        redis.opsForValue().set(keyPrefix + productId, String.valueOf(quantity), Duration.ofSeconds(ttlSeconds));
    }

    public void evict(String productId) {
        redis.delete(keyPrefix + productId);
    }
}
