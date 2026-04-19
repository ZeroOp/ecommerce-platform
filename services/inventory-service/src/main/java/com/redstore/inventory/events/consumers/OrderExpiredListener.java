package com.redstore.inventory.events.consumers;

import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.inventory.service.InventoryService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code order.expired} (emitted by expiration-service) and
 * releases the per-item reservations. From inventory's perspective this is
 * identical to a cancellation — same idempotent path.
 */
@Component
@Slf4j
public class OrderExpiredListener extends BaseListener<OrderExpiredEventData> {

    private final InventoryService inventoryService;

    public OrderExpiredListener(Connection natsConnection, JetStream js, InventoryService inventoryService) {
        super(natsConnection, js, OrderExpiredEventData.class);
        this.inventoryService = inventoryService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_EXPIRED;
    }

    @Override
    protected String getQueueGroupName() {
        return "inventory-service-order-expired";
    }

    @Override
    protected void onMessage(OrderExpiredEventData data, Message msg) {
        try {
            if (data != null) {
                inventoryService.releaseForOrder(data.getOrderId(), data.getItems());
            }
            msg.ack();
        } catch (Exception e) {
            log.error("inventory release-on-expire failed for orderId={}",
                    data != null ? data.getOrderId() : null, e);
            msg.nak();
        }
    }
}
