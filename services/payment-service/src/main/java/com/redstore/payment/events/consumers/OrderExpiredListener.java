package com.redstore.payment.events.consumers;

import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.payment.service.PaymentService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderExpiredListener extends BaseListener<OrderExpiredEventData> {
    private final PaymentService paymentService;

    public OrderExpiredListener(Connection natsConnection, JetStream js, PaymentService paymentService) {
        super(natsConnection, js, OrderExpiredEventData.class);
        this.paymentService = paymentService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_EXPIRED;
    }

    @Override
    protected String getQueueGroupName() {
        return "payment-service-order-expired";
    }

    @Override
    protected void onMessage(OrderExpiredEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                paymentService.markOrderExpired(data.getOrderId());
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
