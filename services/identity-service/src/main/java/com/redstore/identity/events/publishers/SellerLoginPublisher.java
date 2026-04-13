package com.redstore.identity.events.publishers;

import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import com.redstore.common.dto.RoleBasedLoginEventData;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class SellerLoginPublisher extends BasePublisher<RoleBasedLoginEventData> {

    public SellerLoginPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.SELLER_LOGIN;
    }
}
