package com.redstore.identity.events.publishers;

import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import com.redstore.common.dto.SellerRegisteredEventData;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class SellerRegisteredPublisher extends BasePublisher<SellerRegisteredEventData> {

    public SellerRegisteredPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.SELLER_REGISTERED;
    }
}
