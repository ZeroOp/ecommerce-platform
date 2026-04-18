package com.redstore.inventory.events.publishers;

import com.redstore.common.dto.InventoryReleasedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class InventoryReleasedPublisher extends BasePublisher<InventoryReleasedEventData> {

    public InventoryReleasedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.INVENTORY_RELEASED;
    }
}
