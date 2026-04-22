package com.redstore.analytics.events.consumers;

import com.redstore.analytics.service.OrderAnalyticsIngestionService;
import com.redstore.common.dto.OrderCancelledEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderCancelledListener extends BaseListener<OrderCancelledEventData> {
    private final OrderAnalyticsIngestionService service;

    public OrderCancelledListener(Connection natsConnection, JetStream js, OrderAnalyticsIngestionService service) {
        super(natsConnection, js, OrderCancelledEventData.class);
        this.service = service;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CANCELLED;
    }

    @Override
    protected String getQueueGroupName() {
        return "analytics-service-order-cancelled";
    }

    @Override
    protected void onMessage(OrderCancelledEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                service.onOrderCancelled(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
