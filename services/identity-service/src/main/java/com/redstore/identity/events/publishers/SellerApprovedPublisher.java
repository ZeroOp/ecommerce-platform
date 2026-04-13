package com.redstore.identity.events.publishers;

import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import com.redstore.common.dto.SellerStatusEventData;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class SellerApprovedPublisher extends BasePublisher<SellerStatusEventData> {

    public SellerApprovedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.SELLER_APPROVED;
    }
}
