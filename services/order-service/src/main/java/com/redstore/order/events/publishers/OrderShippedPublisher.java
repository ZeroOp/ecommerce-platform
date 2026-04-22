package com.redstore.order.events.publishers;

import com.redstore.common.dto.OrderShippedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class OrderShippedPublisher extends BasePublisher<OrderShippedEventData> {
    public OrderShippedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_SHIPPED;
    }
}
