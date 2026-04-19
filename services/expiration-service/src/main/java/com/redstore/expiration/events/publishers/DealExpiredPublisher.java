package com.redstore.expiration.events.publishers;

import com.redstore.common.dto.DealExpiredEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

/**
 * Fires {@code deal.expired} when an offer reaches its seller-set expiry.
 * Consumers:
 * <ul>
 *   <li>offers-service → marks the Offer row as EXPIRED;</li>
 *   <li>search-service → drops the denormalized discount from product docs;</li>
 *   <li>cart-service → drops the denormalized discount from its catalog replica.</li>
 * </ul>
 */
@Component
public class DealExpiredPublisher extends BasePublisher<DealExpiredEventData> {

    public DealExpiredPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.DEAL_EXPIRED;
    }
}
