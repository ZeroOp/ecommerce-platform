package com.redstore.inventory.client;

import com.redstore.common.exceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class ProductOwnershipClient {

    private final RestTemplate restTemplate;

    @Value("${product.service.base-url}")
    private String productServiceBaseUrl;

    public ProductOwnershipClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Calls product-service seller endpoint; 200 means the current principal owns the product.
     */
    public void assertSellerOwnsProduct(String productId, String authorizationHeader, String cookieHeader) {
        HttpHeaders headers = new HttpHeaders();
        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }
        if (cookieHeader != null && !cookieHeader.isBlank()) {
            headers.add(HttpHeaders.COOKIE, cookieHeader);
        }
        String url = productServiceBaseUrl + "/api/seller/products/" + productId;
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BadRequestException("Product not found");
            }
        } catch (HttpClientErrorException e) {
            int code = e.getStatusCode().value();
            if (code == 404 || code == 403) {
                throw new BadRequestException("Product not found");
            }
            throw e;
        } catch (RestClientException e) {
            throw new BadRequestException("Unable to validate product ownership");
        }
    }
}
