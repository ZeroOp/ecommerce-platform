package com.redstore.analytics.events.consumers;

import com.redstore.analytics.service.OrderAnalyticsIngestionService;
import com.redstore.common.dto.OrderCompletedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderCompletedListener extends BaseListener<OrderCompletedEventData> {
    private final OrderAnalyticsIngestionService service;

    public OrderCompletedListener(Connection natsConnection, JetStream js, OrderAnalyticsIngestionService service) {
        super(natsConnection, js, OrderCompletedEventData.class);
        this.service = service;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_COMPLETED;
    }

    @Override
    protected String getQueueGroupName() {
        return "analytics-service-order-completed";
    }

    @Override
    protected void onMessage(OrderCompletedEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                service.onOrderCompleted(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
