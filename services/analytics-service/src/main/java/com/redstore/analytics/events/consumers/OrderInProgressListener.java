package com.redstore.analytics.events.consumers;

import com.redstore.analytics.service.OrderAnalyticsIngestionService;
import com.redstore.common.dto.OrderInProgressEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderInProgressListener extends BaseListener<OrderInProgressEventData> {
    private final OrderAnalyticsIngestionService service;

    public OrderInProgressListener(Connection natsConnection, JetStream js, OrderAnalyticsIngestionService service) {
        super(natsConnection, js, OrderInProgressEventData.class);
        this.service = service;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_IN_PROGRESS;
    }

    @Override
    protected String getQueueGroupName() {
        return "analytics-service-order-in-progress";
    }

    @Override
    protected void onMessage(OrderInProgressEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                service.onOrderInProgress(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
