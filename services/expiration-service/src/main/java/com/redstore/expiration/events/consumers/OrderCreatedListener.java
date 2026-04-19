package com.redstore.expiration.events.consumers;

import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.expiration.service.ExpirationService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * On every {@code order.created}, record an expiration timer that will
 * fire an {@code order.expired} event at the {@code expiresAt} the order
 * was created with.
 */
@Component
@Slf4j
public class OrderCreatedListener extends BaseListener<OrderCreatedEventData> {

    private final ExpirationService expirationService;

    public OrderCreatedListener(
            Connection natsConnection,
            JetStream js,
            ExpirationService expirationService
    ) {
        super(natsConnection, js, OrderCreatedEventData.class);
        this.expirationService = expirationService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CREATED;
    }

    @Override
    protected String getQueueGroupName() {
        return "expiration-service-order-created";
    }

    @Override
    protected void onMessage(OrderCreatedEventData data, Message msg) {
        try {
            expirationService.scheduleOrderExpiry(data);
            msg.ack();
        } catch (Exception e) {
            log.error("Failed to schedule order expiry for orderId={}", data != null ? data.getOrderId() : null, e);
            msg.nak();
        }
    }
}
