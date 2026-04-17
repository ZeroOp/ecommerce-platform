package com.redstore.product.events.publishers;

import com.redstore.common.dto.BrandCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class BrandCreatedPublisher extends BasePublisher<BrandCreatedEventData> {

    public BrandCreatedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.BRAND_CREATED;
    }
}
