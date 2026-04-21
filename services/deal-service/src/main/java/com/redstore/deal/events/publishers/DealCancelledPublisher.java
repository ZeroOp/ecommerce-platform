package com.redstore.deal.events.publishers;

import com.redstore.common.dto.DealCancelledEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class DealCancelledPublisher extends BasePublisher<DealCancelledEventData> {
    public DealCancelledPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.DEAL_CANCELLED;
    }
}
