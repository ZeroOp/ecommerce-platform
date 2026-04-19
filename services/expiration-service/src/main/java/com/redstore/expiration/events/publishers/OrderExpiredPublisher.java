package com.redstore.expiration.events.publishers;

import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

/**
 * Fires {@code order.expired} when an order's timer elapses. Consumers:
 * <ul>
 *   <li>order-service → flips the order row to EXPIRED;</li>
 *   <li>inventory-service → releases any reserved stock for the order.</li>
 * </ul>
 */
@Component
public class OrderExpiredPublisher extends BasePublisher<OrderExpiredEventData> {

    public OrderExpiredPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.ORDER_EXPIRED;
    }
}
