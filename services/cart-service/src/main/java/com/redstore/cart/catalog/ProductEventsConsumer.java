package com.redstore.cart.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.common.dto.ProductCreatedEventData;
import com.redstore.common.enums.Subjects;
import io.nats.client.JetStreamSubscription;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * Drains the cart-service's own pull subscription on a short cadence and
 * upserts every new product into the local catalog replica (Postgres + Redis
 * cache). Messages we do not handle yet are ACK'd with a debug log so the
 * durable consumer keeps moving.
 */
@Slf4j
@Component
public class ProductEventsConsumer {

    private final JetStreamSubscription subscription;
    private final ProductCatalogService catalogService;
    private final ObjectMapper objectMapper;

    @Value("${cart.nats.fetch-size}")
    private int fetchSize;

    public ProductEventsConsumer(
            JetStreamSubscription productEventsSubscription,
            ProductCatalogService catalogService,
            ObjectMapper objectMapper
    ) {
        this.subscription = productEventsSubscription;
        this.catalogService = catalogService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelayString = "${cart.nats.fetch-interval-ms}")
    public void poll() {
        List<Message> batch;
        try {
            batch = subscription.fetch(fetchSize, Duration.ofSeconds(1));
        } catch (Exception e) {
            log.warn("cart-service: fetch failed: {}", e.getMessage());
            return;
        }
        if (batch == null || batch.isEmpty()) {
            return;
        }

        for (Message msg : batch) {
            try {
                handle(msg);
                msg.ack();
            } catch (Exception e) {
                log.error("cart-service: failed handling subject {}: {}",
                        msg.getSubject(), e.getMessage(), e);
                msg.nakWithDelay(Duration.ofSeconds(5));
            }
        }
    }

    private void handle(Message msg) throws Exception {
        String subject = msg.getSubject();
        if (Subjects.PRODUCT_CREATED.getValue().equals(subject)) {
            ProductCreatedEventData event = objectMapper.readValue(msg.getData(), ProductCreatedEventData.class);
            catalogService.upsertFromCreatedEvent(event);
            return;
        }
        log.debug("cart-service: ignoring event subject {}", subject);
    }
}
