package com.redstore.inventory.events.consumers;

import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.inventory.service.InventoryService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code order.created} and reserves stock per line asynchronously.
 * This replaces the old synchronous {@code POST /api/inventory/reserve} flow —
 * order-service no longer calls us directly for reservations.
 *
 * <p>All reservations for a given order are keyed on
 * {@code order:{orderId}:{productId}} which makes redelivery safe.</p>
 */
@Component
@Slf4j
public class OrderCreatedListener extends BaseListener<OrderCreatedEventData> {

    private final InventoryService inventoryService;

    public OrderCreatedListener(Connection natsConnection, JetStream js, InventoryService inventoryService) {
        super(natsConnection, js, OrderCreatedEventData.class);
        this.inventoryService = inventoryService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CREATED;
    }

    @Override
    protected String getQueueGroupName() {
        return "inventory-service-order-created";
    }

    @Override
    protected void onMessage(OrderCreatedEventData data, Message msg) {
        try {
            if (data != null) {
                inventoryService.reserveForOrder(data.getOrderId(), data.getItems());
            }
            msg.ack();
        } catch (Exception e) {
            log.error("inventory reserve failed for orderId={}", data != null ? data.getOrderId() : null, e);
            msg.nak();
        }
    }
}
