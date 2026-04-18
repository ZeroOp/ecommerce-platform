package com.redstore.inventory.events.publishers;

import com.redstore.common.dto.InventoryStockAddedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class InventoryStockAddedPublisher extends BasePublisher<InventoryStockAddedEventData> {

    public InventoryStockAddedPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.INVENTORY_STOCK_ADDED;
    }
}
