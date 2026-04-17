package com.redstore.product.events.publishers;

import com.redstore.common.dto.CategoryCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class CategoryCreatedPublisher extends BasePublisher<CategoryCreatedEventData> {

    public CategoryCreatedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.CATEGORY_CREATED;
    }
}
