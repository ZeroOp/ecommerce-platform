package com.redstore.cart.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.cart.dto.CartItemDto;
import com.redstore.common.exceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Stores the cart as a Redis hash keyed by {@code cart:{userId}} — one entry
 * per productId, JSON-encoded, so every shard in the cluster can own a slice
 * of the carts without cross-slot operations.
 */
@Repository
public class CartRepository {

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    @Value("${cart.key-prefix}")
    private String keyPrefix;

    @Value("${cart.ttl-days}")
    private long ttlDays;

    @Value("${cart.max-items}")
    private int maxItems;

    public CartRepository(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    private String keyFor(String userId) {
        // The {…} hashtag pins every field of this cart to the same cluster
        // slot, which is not strictly needed for a single hash key but keeps
        // future multi-key ops (pipelines, MGET) safe.
        return keyPrefix + "{" + userId + "}";
    }

    public List<CartItemDto> loadAll(String userId) {
        Map<Object, Object> raw = redis.opsForHash().entries(keyFor(userId));
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        List<CartItemDto> items = new ArrayList<>(raw.size());
        for (Map.Entry<Object, Object> entry : raw.entrySet()) {
            CartItemDto item = decode(Objects.toString(entry.getValue(), null));
            if (item != null) {
                items.add(item);
            }
        }
        items.sort((a, b) -> {
            Instant ai = a.addedAt() != null ? a.addedAt() : Instant.EPOCH;
            Instant bi = b.addedAt() != null ? b.addedAt() : Instant.EPOCH;
            return ai.compareTo(bi);
        });
        return items;
    }

    public CartItemDto get(String userId, String productId) {
        Object raw = redis.opsForHash().get(keyFor(userId), productId);
        return decode(Objects.toString(raw, null));
    }

    public void put(String userId, CartItemDto item) {
        String key = keyFor(userId);
        long size = redis.opsForHash().size(key);
        if (size >= maxItems && redis.opsForHash().get(key, item.productId()) == null) {
            throw new BadRequestException("Cart is full (max " + maxItems + " distinct items)");
        }
        redis.opsForHash().put(key, item.productId(), encode(item));
        redis.expire(key, Duration.ofDays(ttlDays));
    }

    public void remove(String userId, String productId) {
        redis.opsForHash().delete(keyFor(userId), productId);
    }

    public void clear(String userId) {
        redis.delete(keyFor(userId));
    }

    private String encode(CartItemDto item) {
        try {
            return objectMapper.writeValueAsString(item);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Failed to encode cart item: " + e.getMessage());
        }
    }

    private CartItemDto decode(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            return objectMapper.readValue(raw, CartItemDto.class);
        } catch (Exception e) {
            return null;
        }
    }
}
