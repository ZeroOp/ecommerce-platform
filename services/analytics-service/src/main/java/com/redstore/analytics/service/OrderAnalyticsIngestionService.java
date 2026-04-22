package com.redstore.analytics.service;

import com.redstore.analytics.repository.OrderAnalyticsRepository;
import com.redstore.common.dto.OrderCancelledEventData;
import com.redstore.common.dto.OrderCompletedEventData;
import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.dto.OrderExpiredEventData;
import com.redstore.common.dto.OrderInProgressEventData;
import com.redstore.common.dto.OrderItemData;
import com.redstore.common.dto.OrderShippedEventData;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderAnalyticsIngestionService {

    private final OrderAnalyticsRepository repository;

    public OrderAnalyticsIngestionService(OrderAnalyticsRepository repository) {
        this.repository = repository;
    }

    public void onOrderCreated(OrderCreatedEventData e) {
        repository.insertEvent(
                e.getOrderId(),
                e.getUserId(),
                sellerIds(e.getItems()),
                "CREATED",
                "order.created",
                e.getSubtotal(),
                e.getCreatedAt()
        );
    }

    public void onOrderInProgress(OrderInProgressEventData e) {
        repository.insertEvent(
                e.getOrderId(),
                e.getUserId(),
                Set.of(),
                "IN_PROGRESS",
                "order.in_progress",
                BigDecimal.ZERO,
                e.getUpdatedAt()
        );
    }

    public void onOrderShipped(OrderShippedEventData e) {
        repository.insertEvent(
                e.getOrderId(),
                e.getUserId(),
                Set.of(e.getSellerId()),
                "SHIPPED",
                "order.shipped",
                BigDecimal.ZERO,
                e.getShippedAt()
        );
    }

    public void onOrderCompleted(OrderCompletedEventData e) {
        repository.insertEvent(
                e.getOrderId(),
                e.getUserId(),
                sellerIds(e.getItems()),
                "COMPLETED",
                "order.completed",
                BigDecimal.ZERO,
                e.getCompletedAt()
        );
    }

    public void onOrderCancelled(OrderCancelledEventData e) {
        repository.insertEvent(
                e.getOrderId(),
                e.getUserId(),
                sellerIds(e.getItems()),
                "CANCELLED",
                "order.cancelled",
                BigDecimal.ZERO,
                e.getCancelledAt()
        );
    }

    public void onOrderExpired(OrderExpiredEventData e) {
        repository.insertEvent(
                e.getOrderId(),
                e.getUserId(),
                sellerIds(e.getItems()),
                "EXPIRED",
                "order.expired",
                BigDecimal.ZERO,
                e.getExpiredAt() == null ? Instant.now() : e.getExpiredAt()
        );
    }

    private Set<String> sellerIds(java.util.List<OrderItemData> items) {
        if (items == null || items.isEmpty()) return Set.of();
        return items.stream()
                .map(OrderItemData::getSellerId)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toSet());
    }
}
