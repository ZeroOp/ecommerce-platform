package com.redstore.inventory.events.publishers;

import com.redstore.common.dto.InventoryReservedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class InventoryReservedPublisher extends BasePublisher<InventoryReservedEventData> {

    public InventoryReservedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.INVENTORY_RESERVED;
    }
}
