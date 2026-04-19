package com.redstore.expiration.events.consumers;

import com.redstore.common.dto.DealCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BaseListener;
import com.redstore.expiration.service.ExpirationService;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * On every {@code deal.created}, schedule a {@code deal.expired} emit for
 * the seller-chosen expiry. See {@link ExpirationService#scheduleDealExpiry}
 * for the upsert semantics.
 */
@Component
@Slf4j
public class DealCreatedListener extends BaseListener<DealCreatedEventData> {

    private final ExpirationService expirationService;

    public DealCreatedListener(
            Connection natsConnection,
            JetStream js,
            ExpirationService expirationService
    ) {
        super(natsConnection, js, DealCreatedEventData.class);
        this.expirationService = expirationService;
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.DEAL_CREATED;
    }

    @Override
    protected String getQueueGroupName() {
        return "expiration-service-deal-created";
    }

    @Override
    protected void onMessage(DealCreatedEventData data, Message msg) {
        try {
            expirationService.scheduleDealExpiry(data);
            msg.ack();
        } catch (Exception e) {
            log.error("Failed to schedule deal expiry for dealId={}", data != null ? data.getDealId() : null, e);
            msg.nak();
        }
    }
}
