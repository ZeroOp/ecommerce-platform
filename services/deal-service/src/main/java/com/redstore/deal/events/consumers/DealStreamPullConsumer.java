package com.redstore.deal.events.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.common.dto.BrandCreatedEventData;
import com.redstore.common.dto.BrandUpdatedEventData;
import com.redstore.common.dto.CategoryCreatedEventData;
import com.redstore.common.dto.DealExpiredEventData;
import com.redstore.common.dto.ProductCreatedEventData;
import com.redstore.common.enums.Subjects;
import com.redstore.deal.service.DealService;
import com.redstore.deal.service.ReplicaSyncService;
import io.nats.client.JetStreamSubscription;
import io.nats.client.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * JetStream pull consumers for deal-service — mirrors the proven pattern used by
 * search-service so {@code product.*} replicas and {@code deal.expired} stay in sync.
 */
@Component
@Slf4j
public class DealStreamPullConsumer {

    private final JetStreamSubscription catalogSubscription;
    private final JetStreamSubscription dealsSubscription;
    private final ObjectMapper objectMapper;
    private final ReplicaSyncService replicaSyncService;
    private final DealService dealService;

    @Value("${deal.nats.fetch-size}")
    private int fetchSize;

    public DealStreamPullConsumer(
            JetStreamSubscription dealCatalogPullSubscription,
            JetStreamSubscription dealLifecyclePullSubscription,
            ObjectMapper objectMapper,
            ReplicaSyncService replicaSyncService,
            DealService dealService
    ) {
        this.catalogSubscription = dealCatalogPullSubscription;
        this.dealsSubscription = dealLifecyclePullSubscription;
        this.objectMapper = objectMapper;
        this.replicaSyncService = replicaSyncService;
        this.dealService = dealService;
    }

    @Scheduled(fixedDelayString = "${deal.nats.fetch-interval-ms}")
    public void pollCatalog() {
        List<Message> batch;
        try {
            batch = catalogSubscription.fetch(fetchSize, Duration.ofSeconds(1));
        } catch (Exception e) {
            log.warn("deal-service: catalog fetch failed: {}", e.getMessage());
            return;
        }
        if (batch == null || batch.isEmpty()) {
            return;
        }
        for (Message msg : batch) {
            try {
                handleCatalog(msg);
                msg.ack();
            } catch (Exception e) {
                log.error("deal-service: catalog message failed subject={}: {}", msg.getSubject(), e.getMessage(), e);
                msg.nakWithDelay(Duration.ofSeconds(5));
            }
        }
    }

    @Scheduled(fixedDelayString = "${deal.nats.fetch-interval-ms}")
    public void pollDeals() {
        List<Message> batch;
        try {
            batch = dealsSubscription.fetch(fetchSize, Duration.ofSeconds(1));
        } catch (Exception e) {
            log.warn("deal-service: deals fetch failed: {}", e.getMessage());
            return;
        }
        if (batch == null || batch.isEmpty()) {
            return;
        }
        for (Message msg : batch) {
            try {
                handleDeals(msg);
                msg.ack();
            } catch (Exception e) {
                log.error("deal-service: deals message failed subject={}: {}", msg.getSubject(), e.getMessage(), e);
                msg.nakWithDelay(Duration.ofSeconds(5));
            }
        }
    }

    private void handleCatalog(Message msg) throws Exception {
        String subject = msg.getSubject();
        byte[] data = msg.getData();

        if (Subjects.PRODUCT_CREATED.getValue().equals(subject)) {
            replicaSyncService.upsertProduct(objectMapper.readValue(data, ProductCreatedEventData.class));
            return;
        }
        if (Subjects.BRAND_CREATED.getValue().equals(subject)) {
            replicaSyncService.upsertBrand(objectMapper.readValue(data, BrandCreatedEventData.class));
            return;
        }
        if (Subjects.BRAND_UPDATED.getValue().equals(subject)) {
            replicaSyncService.upsertBrand(objectMapper.readValue(data, BrandUpdatedEventData.class));
            return;
        }
        if (Subjects.CATEGORY_CREATED.getValue().equals(subject)) {
            replicaSyncService.upsertCategory(objectMapper.readValue(data, CategoryCreatedEventData.class));
            return;
        }

        log.debug("deal-service: ignoring catalog subject {}", subject);
    }

    private void handleDeals(Message msg) throws Exception {
        String subject = msg.getSubject();
        byte[] data = msg.getData();

        if (Subjects.DEAL_EXPIRED.getValue().equals(subject)) {
            dealService.markExpired(objectMapper.readValue(data, DealExpiredEventData.class));
            return;
        }

        log.debug("deal-service: ignoring deals-stream subject {}", subject);
    }
}
