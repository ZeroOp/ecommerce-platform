package com.redstore.order.events.consumers;

import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.order.service.OrderService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code order.expired} events published by expiration-service and
 * flips the underlying order row to EXPIRED (if it's still CREATED).
 *
 * <p>Inventory-service listens to the same subject and releases reserved
 * stock — we don't coordinate with it here; NATS delivers to both consumers
 * independently via queue groups.</p>
 */
@Component
public class OrderExpiredListener extends BaseListener<OrderExpiredEventData> {

    private final OrderService orderService;

    public OrderExpiredListener(Connection natsConnection, JetStream js, OrderService orderService) {
        super(natsConnection, js, OrderExpiredEventData.class);
        this.orderService = orderService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_EXPIRED;
    }

    @Override
    protected String getQueueGroupName() {
        return "order-service-order-expired";
    }

    @Override
    protected void onMessage(OrderExpiredEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                orderService.markExpired(data.getOrderId());
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
