package com.redstore.deal.events.publishers;

import com.redstore.common.dto.DealCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class DealCreatedPublisher extends BasePublisher<DealCreatedEventData> {
    public DealCreatedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.DEAL_CREATED;
    }
}
