package com.redstore.analytics.events.consumers;

import com.redstore.analytics.service.OrderAnalyticsIngestionService;
import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderExpiredListener extends BaseListener<OrderExpiredEventData> {
    private final OrderAnalyticsIngestionService service;

    public OrderExpiredListener(Connection natsConnection, JetStream js, OrderAnalyticsIngestionService service) {
        super(natsConnection, js, OrderExpiredEventData.class);
        this.service = service;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_EXPIRED;
    }

    @Override
    protected String getQueueGroupName() {
        return "analytics-service-order-expired";
    }

    @Override
    protected void onMessage(OrderExpiredEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                service.onOrderExpired(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
