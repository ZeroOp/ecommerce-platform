package com.redstore.analytics.events.consumers;

import com.redstore.analytics.service.OrderAnalyticsIngestionService;
import com.redstore.common.dto.OrderShippedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderShippedListener extends BaseListener<OrderShippedEventData> {
    private final OrderAnalyticsIngestionService service;

    public OrderShippedListener(Connection natsConnection, JetStream js, OrderAnalyticsIngestionService service) {
        super(natsConnection, js, OrderShippedEventData.class);
        this.service = service;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_SHIPPED;
    }

    @Override
    protected String getQueueGroupName() {
        return "analytics-service-order-shipped";
    }

    @Override
    protected void onMessage(OrderShippedEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                service.onOrderShipped(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
