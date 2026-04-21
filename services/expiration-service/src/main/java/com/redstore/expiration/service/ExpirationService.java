package com.redstore.expiration.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.redstore.common.dto.DealCreatedEventData;
import com.redstore.common.dto.DealExpiredEventData;
import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.expiration.entity.ExpirationJob;
import com.redstore.expiration.entity.ExpirationType;
import com.redstore.expiration.events.publishers.DealExpiredPublisher;
import com.redstore.expiration.events.publishers.OrderExpiredPublisher;
import com.redstore.expiration.repository.ExpirationJobRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Brains of expiration-service — exposes two thin write paths called by
 * the listeners, plus a sweep method invoked by the scheduler.
 *
 * <p>Idempotency: both {@code scheduleOrderExpiry} and {@code scheduleDealExpiry}
 * look up by {@code (type, entityId)} and update the existing row if one is
 * already there. Message redelivery on the upstream {@code .created} stream
 * therefore doesn't create duplicate timers.</p>
 */
@Service
@Slf4j
public class ExpirationService {

    private final ExpirationJobRepository repository;
    private final OrderExpiredPublisher orderExpiredPublisher;
    private final DealExpiredPublisher dealExpiredPublisher;
    private final ObjectMapper objectMapper;

    public ExpirationService(
            ExpirationJobRepository repository,
            OrderExpiredPublisher orderExpiredPublisher,
            DealExpiredPublisher dealExpiredPublisher
    ) {
        this.repository = repository;
        this.orderExpiredPublisher = orderExpiredPublisher;
        this.dealExpiredPublisher = dealExpiredPublisher;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    // ------------------------------------------------------------------
    // schedule
    // ------------------------------------------------------------------

    @Transactional
    public void scheduleOrderExpiry(OrderCreatedEventData evt) {
        if (evt == null || evt.getOrderId() == null || evt.getExpiresAt() == null) {
            log.warn("Ignoring order.created with missing fields: {}", evt);
            return;
        }

        OrderExpiredEventData payload = OrderExpiredEventData.builder()
                .orderId(evt.getOrderId())
                .userId(evt.getUserId())
                .items(evt.getItems())
                .expiredAt(evt.getExpiresAt())
                .build();

        upsert(ExpirationType.ORDER, evt.getOrderId(), evt.getExpiresAt(), payload);
    }

    @Transactional
    public void scheduleDealExpiry(DealCreatedEventData evt) {
        if (evt == null || evt.getDealId() == null || evt.getExpiresAt() == null) {
            log.warn("Ignoring deal.created with missing fields: {}", evt);
            return;
        }

        DealExpiredEventData payload = DealExpiredEventData.builder()
                .dealId(evt.getDealId())
                .scope(evt.getScope())
                .productId(evt.getProductId())
                .brandId(evt.getBrandId())
                .categoryId(evt.getCategoryId())
                .sellerId(evt.getSellerId())
                .expiredAt(evt.getExpiresAt())
                .build();

        upsert(ExpirationType.DEAL, evt.getDealId(), evt.getExpiresAt(), payload);
    }

    /**
     * Upsert semantics — redelivery of a {@code .created} event will refresh
     * the timer (unusual but harmless) rather than insert a duplicate row.
     * If the job has already fired we just ignore — the world has moved on.
     */
    private void upsert(ExpirationType type, String entityId, Instant fireAt, Object payload) {
        ExpirationJob existing = repository.findByTypeAndEntityId(type, entityId).orElse(null);
        String json = toJson(payload);

        if (existing == null) {
            repository.save(ExpirationJob.builder()
                    .id("exp-" + UUID.randomUUID())
                    .type(type)
                    .entityId(entityId)
                    .fireAt(fireAt)
                    .fired(false)
                    .payloadJson(json)
                    .createdAt(Instant.now())
                    .build());
            log.info("Scheduled {} expiry for {} at {}", type, entityId, fireAt);
            return;
        }

        if (existing.isFired()) {
            log.debug("{} {} already fired — not re-scheduling", type, entityId);
            return;
        }
        existing.setFireAt(fireAt);
        existing.setPayloadJson(json);
        repository.save(existing);
    }

    // ------------------------------------------------------------------
    // sweep
    // ------------------------------------------------------------------

    /**
     * Invoked by the scheduler. We run the whole batch inside a single
     * transaction so the row-level locks obtained by the repository hold
     * for the duration — another replica won't fire these twice.
     */
    @Transactional
    public int sweepDue(Instant now, int maxBatch) {
        List<ExpirationJob> due = repository.findDueForFire(now, PageRequest.of(0, maxBatch));
        if (due.isEmpty()) return 0;

        int fired = 0;
        for (ExpirationJob job : due) {
            try {
                publishFor(job);
                job.setFired(true);
                job.setFiredAt(Instant.now());
                repository.save(job);
                fired++;
            } catch (Exception e) {
                // Leave the row unfired; the next sweep will retry. Logging only —
                // we don't rethrow because a single poisoned row shouldn't stop
                // the batch from draining.
                log.error("Failed to fire expiration job {} ({}:{})", job.getId(), job.getType(), job.getEntityId(), e);
            }
        }
        return fired;
    }

    private void publishFor(ExpirationJob job) throws JsonProcessingException {
        switch (job.getType()) {
            case ORDER -> {
                OrderExpiredEventData data = objectMapper.readValue(job.getPayloadJson(), OrderExpiredEventData.class);
                orderExpiredPublisher.publish(data);
            }
            case DEAL -> {
                DealExpiredEventData data = objectMapper.readValue(job.getPayloadJson(), DealExpiredEventData.class);
                dealExpiredPublisher.publish(data);
            }
        }
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize expiration payload", e);
        }
    }
}
