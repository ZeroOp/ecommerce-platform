package com.redstore.analytics.events.consumers;

import com.redstore.analytics.service.OrderAnalyticsIngestionService;
import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener extends BaseListener<OrderCreatedEventData> {
    private final OrderAnalyticsIngestionService service;

    public OrderCreatedListener(Connection natsConnection, JetStream js, OrderAnalyticsIngestionService service) {
        super(natsConnection, js, OrderCreatedEventData.class);
        this.service = service;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CREATED;
    }

    @Override
    protected String getQueueGroupName() {
        return "analytics-service-order-created";
    }

    @Override
    protected void onMessage(OrderCreatedEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                service.onOrderCreated(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
