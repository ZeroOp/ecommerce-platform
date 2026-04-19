package com.redstore.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Order-service bootstrap.
 *
 * <p>No {@code @EnableScheduling} on purpose — expiry scheduling is owned
 * by the external expiration-service. Order-service is pure request/response
 * and event-driven.</p>
 */
@SpringBootApplication(scanBasePackages = {"com.redstore.order", "com.redstore.common"})
public class OrderApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
