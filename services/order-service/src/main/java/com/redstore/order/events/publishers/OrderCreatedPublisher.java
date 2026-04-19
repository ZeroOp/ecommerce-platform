package com.redstore.order.events.publishers;

import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedPublisher extends BasePublisher<OrderCreatedEventData> {

    public OrderCreatedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_CREATED;
    }
}
