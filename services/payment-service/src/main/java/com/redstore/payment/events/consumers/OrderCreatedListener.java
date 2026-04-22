package com.redstore.payment.events.consumers;

import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.payment.service.PaymentService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener extends BaseListener<OrderCreatedEventData> {
    private final PaymentService paymentService;

    public OrderCreatedListener(Connection natsConnection, JetStream js, PaymentService paymentService) {
        super(natsConnection, js, OrderCreatedEventData.class);
        this.paymentService = paymentService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CREATED;
    }

    @Override
    protected String getQueueGroupName() {
        return "payment-service-order-created";
    }

    @Override
    protected void onMessage(OrderCreatedEventData data, Message msg) {
        try {
            paymentService.upsertOrderCreated(data);
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
