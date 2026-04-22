package com.redstore.payment.events.publishers;

import com.redstore.common.dto.PaymentOrderCompleteEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class PaymentOrderCompletePublisher extends BasePublisher<PaymentOrderCompleteEventData> {
    public PaymentOrderCompletePublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.PAYMENT_ORDER_COMPLETE;
    }
}
