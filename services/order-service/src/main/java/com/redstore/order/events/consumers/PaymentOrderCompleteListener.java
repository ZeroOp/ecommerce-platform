package com.redstore.order.events.consumers;

import com.redstore.common.dto.PaymentOrderCompleteEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.order.service.OrderService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import org.springframework.stereotype.Component;

@Component
public class PaymentOrderCompleteListener extends BaseListener<PaymentOrderCompleteEventData> {
    private final OrderService orderService;

    public PaymentOrderCompleteListener(Connection natsConnection, JetStream js, OrderService orderService) {
        super(natsConnection, js, PaymentOrderCompleteEventData.class);
        this.orderService = orderService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.PAYMENT_ORDER_COMPLETE;
    }

    @Override
    protected String getQueueGroupName() {
        return "order-service-payment-complete";
    }

    @Override
    protected void onMessage(PaymentOrderCompleteEventData data, Message msg) {
        try {
            if (data != null && data.getOrderId() != null) {
                orderService.markInProgressFromPayment(data);
            }
            msg.ack();
        } catch (Exception e) {
            msg.nak();
            throw e;
        }
    }
}
