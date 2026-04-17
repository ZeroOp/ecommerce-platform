package com.redstore.product.events.publishers;

import com.redstore.common.dto.ProductCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class ProductCreatedPublisher extends BasePublisher<ProductCreatedEventData> {

    public ProductCreatedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.PRODUCT_CREATED;
    }
}
