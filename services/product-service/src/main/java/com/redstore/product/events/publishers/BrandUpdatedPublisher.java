package com.redstore.product.events.publishers;

import com.redstore.common.dto.BrandUpdatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class BrandUpdatedPublisher extends BasePublisher<BrandUpdatedEventData> {

    public BrandUpdatedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.BRAND_UPDATED;
    }
}
