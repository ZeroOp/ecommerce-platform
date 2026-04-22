package com.redstore.order.events.publishers;

import com.redstore.common.dto.OrderInProgressEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class OrderInProgressPublisher extends BasePublisher<OrderInProgressEventData> {
    public OrderInProgressPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_IN_PROGRESS;
    }
}
