package com.redstore.expiration.events.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.common.dto.DealCreatedEventData;
import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.expiration.service.ExpirationService;
import io.nats.client.JetStreamSubscription;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
@Slf4j
public class ExpirationPullConsumer {
    private final JetStreamSubscription orderCreatedSubscription;
    private final JetStreamSubscription dealCreatedSubscription;
    private final ExpirationService expirationService;
    private final ObjectMapper objectMapper;

    @Value("${expiration.nats.fetch-size}")
    private int fetchSize;

    public ExpirationPullConsumer(
            JetStreamSubscription expirationOrderCreatedSubscription,
            JetStreamSubscription expirationDealCreatedSubscription,
            ExpirationService expirationService,
            ObjectMapper objectMapper
    ) {
        this.orderCreatedSubscription = expirationOrderCreatedSubscription;
        this.dealCreatedSubscription = expirationDealCreatedSubscription;
        this.expirationService = expirationService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelayString = "${expiration.nats.fetch-interval-ms}")
    public void pollOrders() {
        poll(orderCreatedSubscription, this::handleOrderCreated, "orders");
    }

    @Scheduled(fixedDelayString = "${expiration.nats.fetch-interval-ms}")
    public void pollDeals() {
        poll(dealCreatedSubscription, this::handleDealCreated, "deals");
    }

    private void poll(JetStreamSubscription subscription, Handler handler, String label) {
        List<Message> batch;
        try {
            batch = subscription.fetch(fetchSize, Duration.ofSeconds(1));
        } catch (Exception e) {
            log.warn("expiration-service: {} fetch failed: {}", label, e.getMessage());
            return;
        }
        if (batch == null || batch.isEmpty()) {
            return;
        }
        for (Message msg : batch) {
            try {
                handler.handle(msg);
                msg.ack();
            } catch (Exception e) {
                log.error("expiration-service: {} message failed subject={}: {}", label, msg.getSubject(), e.getMessage(), e);
                msg.nakWithDelay(Duration.ofSeconds(5));
            }
        }
    }

    private void handleOrderCreated(Message msg) throws Exception {
        if (!Subjects.ORDER_CREATED.getValue().equals(msg.getSubject())) {
            return;
        }
        OrderCreatedEventData data = objectMapper.readValue(msg.getData(), OrderCreatedEventData.class);
        expirationService.scheduleOrderExpiry(data);
    }

    private void handleDealCreated(Message msg) throws Exception {
        if (!Subjects.DEAL_CREATED.getValue().equals(msg.getSubject())) {
            return;
        }
        DealCreatedEventData data = objectMapper.readValue(msg.getData(), DealCreatedEventData.class);
        expirationService.scheduleDealExpiry(data);
    }

    @FunctionalInterface
    private interface Handler {
        void handle(Message msg) throws Exception;
    }
}
