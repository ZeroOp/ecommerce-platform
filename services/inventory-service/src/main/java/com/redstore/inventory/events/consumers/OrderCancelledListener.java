package com.redstore.inventory.events.consumers;

import com.redstore.common.dto.OrderCancelledEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.inventory.service.InventoryService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code order.cancelled} and releases the per-item reservations
 * recorded at {@code order.created} time.
 */
@Component
@Slf4j
public class OrderCancelledListener extends BaseListener<OrderCancelledEventData> {

    private final InventoryService inventoryService;

    public OrderCancelledListener(Connection natsConnection, JetStream js, InventoryService inventoryService) {
        super(natsConnection, js, OrderCancelledEventData.class);
        this.inventoryService = inventoryService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CANCELLED;
    }

    @Override
    protected String getQueueGroupName() {
        return "inventory-service-order-cancelled";
    }

    @Override
    protected void onMessage(OrderCancelledEventData data, Message msg) {
        try {
            if (data != null) {
                inventoryService.releaseForOrder(data.getOrderId(), data.getItems());
            }
            msg.ack();
        } catch (Exception e) {
            log.error("inventory release-on-cancel failed for orderId={}",
                    data != null ? data.getOrderId() : null, e);
            msg.nak();
        }
    }
}
