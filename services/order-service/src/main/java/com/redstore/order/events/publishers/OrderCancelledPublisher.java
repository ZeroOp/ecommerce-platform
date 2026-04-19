package com.redstore.order.events.publishers;

import com.redstore.common.dto.OrderCancelledEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class OrderCancelledPublisher extends BasePublisher<OrderCancelledEventData> {

    public OrderCancelledPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CANCELLED;
    }
}
