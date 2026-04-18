package com.redstore.cart.client;

import com.redstore.common.exceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class InventoryClient {

    private final RestTemplate restTemplate;

    @Value("${inventory.service.base-url}")
    private String baseUrl;

    @Value("${inventory.internal.api-key}")
    private String internalApiKey;

    public InventoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** Batch quantity lookup — returns productId → availableQuantity. */
    public Map<String, Integer> getBatchQuantities(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }
        String url = UriComponentsBuilder
                .fromHttpUrl(baseUrl)
                .path("/api/inventory/public/quantities")
                .queryParam("productIds", String.join(",", productIds))
                .toUriString();
        try {
            ResponseEntity<Map<String, Integer>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    HttpEntity.EMPTY,
                    new ParameterizedTypeReference<Map<String, Integer>>() {}
            );
            Map<String, Integer> body = response.getBody();
            return body != null ? body : Collections.emptyMap();
        } catch (RestClientException e) {
            throw new BadRequestException("Inventory service unavailable");
        }
    }

    /** Reserve stock for a single product via the inventory internal endpoint. */
    public ReserveOutcome reserve(String productId, int quantity, String orderRef) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Key", internalApiKey);

        Map<String, Object> body = Map.of(
                "productId", productId,
                "quantity", quantity,
                "orderRef", orderRef
        );
        String url = baseUrl + "/api/inventory/internal/reserve";
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> payload = response.getBody();
            if (payload == null) {
                return new ReserveOutcome(false, "UNKNOWN", "Empty response from inventory");
            }
            Object success = payload.get("success");
            if (Boolean.TRUE.equals(success)) {
                return new ReserveOutcome(true, null, null);
            }
            return new ReserveOutcome(
                    false,
                    String.valueOf(payload.getOrDefault("code", "FAILED")),
                    String.valueOf(payload.getOrDefault("message", "Inventory reserve failed"))
            );
        } catch (RestClientException e) {
            return new ReserveOutcome(false, "INVENTORY_UNAVAILABLE", e.getMessage());
        }
    }

    /** Best-effort release — used when a later reservation fails and we need to roll back. */
    public void release(String orderRef) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Key", internalApiKey);

        Map<String, Object> body = Map.of("orderRef", orderRef);
        String url = baseUrl + "/api/inventory/internal/release";
        try {
            restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
        } catch (RestClientException ignored) {
            // Swallow: release is compensating; an async reconciliation job will retry.
        }
    }

    public record ReserveOutcome(boolean success, String code, String message) {}
}
