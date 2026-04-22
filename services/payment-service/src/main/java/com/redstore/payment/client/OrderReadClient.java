package com.redstore.payment.client;

import com.redstore.payment.dto.OrderSnapshotDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Loads order details from order-service using the end-user session cookie so we
 * can build a payment row when JetStream has not processed {@code order.created} yet.
 */
@Component
public class OrderReadClient {

    private final RestClient restClient;

    public OrderReadClient(@Value("${redstore.orders.base-url:http://order-srv:8080}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    /**
     * @param cookieHeader raw {@code Cookie} header from the incoming request (must include {@code session})
     */
    public OrderSnapshotDto fetchOrder(String orderId, String cookieHeader) {
        if (cookieHeader == null || cookieHeader.isBlank()) {
            return null;
        }
        try {
            return restClient.get()
                    .uri("/api/orders/{id}", orderId)
                    .header(HttpHeaders.COOKIE, cookieHeader)
                    .retrieve()
                    .body(OrderSnapshotDto.class);
        } catch (Exception e) {
            return null;
        }
    }
}
