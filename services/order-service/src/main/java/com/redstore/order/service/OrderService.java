package com.redstore.order.service;

import com.redstore.common.dto.OrderCancelledEventData;
import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.dto.OrderItemData;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import com.redstore.order.dto.CreateOrderItemRequest;
import com.redstore.order.dto.CreateOrderRequest;
import com.redstore.order.dto.OrderDto;
import com.redstore.order.entity.OrderEntity;
import com.redstore.order.entity.OrderItemEntity;
import com.redstore.order.entity.OrderStatus;
import com.redstore.order.events.publishers.OrderCancelledPublisher;
import com.redstore.order.events.publishers.OrderCreatedPublisher;
import com.redstore.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Pure write/command service for orders.
 *
 * <p>Design commitments:</p>
 * <ul>
 *   <li><b>No synchronous calls</b> to inventory, product, search, or cart
 *       services. The UI sends the full cart snapshot (name, image, unit
 *       price, seller, quantity) in {@link CreateOrderRequest} and we trust
 *       and persist it verbatim. Whatever the user was shown becomes the
 *       immutable order history.</li>
 *   <li><b>No in-process expiry scheduler</b>. The dedicated expiration-service
 *       owns the clock: it consumes {@code order.created}, stores a job row,
 *       and emits {@code order.expired} at the right time. Order-service
 *       listens to that event and flips the status — see {@code
 *       events.consumers.OrderExpiredListener}.</li>
 *   <li><b>Inventory reservation</b> is purely event-driven. Inventory
 *       listens for {@code order.created} and reserves asynchronously.
 *       Release happens on {@code order.cancelled} / {@code order.expired}.</li>
 * </ul>
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderCreatedPublisher orderCreatedPublisher;
    private final OrderCancelledPublisher orderCancelledPublisher;

    @Value("${order.expiry.minutes}")
    private long expiryMinutes;

    public OrderService(
            OrderRepository orderRepository,
            OrderCreatedPublisher orderCreatedPublisher,
            OrderCancelledPublisher orderCancelledPublisher
    ) {
        this.orderRepository = orderRepository;
        this.orderCreatedPublisher = orderCreatedPublisher;
        this.orderCancelledPublisher = orderCancelledPublisher;
    }

    // ------------------------------------------------------------------
    // Queries
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<OrderDto> listMyOrders() {
        UserPayload user = requireUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(OrderDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getMyOrder(String orderId) {
        UserPayload user = requireUser();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));
        if (!order.getUserId().equals(user.getId())) {
            throw new NotAuthorizedException();
        }
        return OrderDto.from(order);
    }

    // ------------------------------------------------------------------
    // Create
    // ------------------------------------------------------------------

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        UserPayload user = requireUser();

        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofMinutes(expiryMinutes));
        String orderId = "ord-" + UUID.randomUUID();

        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .userId(user.getId())
                .userEmail(user.getEmail())
                .status(OrderStatus.CREATED)
                .subtotal(BigDecimal.ZERO)
                .expiresAt(expiresAt)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderItemRequest line : request.items()) {
            BigDecimal unitPrice = line.unitPrice() != null ? line.unitPrice() : BigDecimal.ZERO;
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(line.quantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);

            OrderItemEntity item = OrderItemEntity.builder()
                    .id("oi-" + UUID.randomUUID())
                    .productId(line.productId())
                    .sellerId(blankToNull(line.sellerId()))
                    .name(blankToNull(line.name()) != null ? line.name() : line.productId())
                    .imageUrl(blankToNull(line.imageUrl()))
                    .quantity(line.quantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();
            order.addItem(item);
        }
        order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        OrderEntity saved = orderRepository.save(order);

        orderCreatedPublisher.publish(OrderCreatedEventData.builder()
                .orderId(saved.getId())
                .userId(saved.getUserId())
                .userEmail(saved.getUserEmail())
                .items(toEventItems(saved))
                .subtotal(saved.getSubtotal())
                .createdAt(now)
                .expiresAt(expiresAt)
                .build());

        return OrderDto.from(saved);
    }

    // ------------------------------------------------------------------
    // Cancel
    // ------------------------------------------------------------------

    @Transactional
    public OrderDto cancelOrder(String orderId, String reason) {
        UserPayload user = requireUser();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));
        if (!order.getUserId().equals(user.getId())) {
            throw new NotAuthorizedException();
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new BadRequestException("Completed orders cannot be cancelled");
        }
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.EXPIRED) {
            return OrderDto.from(order);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        order.setCancellationReason(blankToNull(reason));
        OrderEntity saved = orderRepository.save(order);

        orderCancelledPublisher.publish(OrderCancelledEventData.builder()
                .orderId(saved.getId())
                .userId(saved.getUserId())
                .items(toEventItems(saved))
                .reason(saved.getCancellationReason())
                .cancelledAt(saved.getCancelledAt())
                .build());

        return OrderDto.from(saved);
    }

    // ------------------------------------------------------------------
    // Expire (driven by external expiration-service)
    // ------------------------------------------------------------------

    /**
     * Invoked by {@code OrderExpiredListener} when expiration-service emits
     * {@code order.expired}. We only flip a row that is still CREATED —
     * everything else (CANCELLED, COMPLETED, IN_PROGRESS) is terminal or
     * already handled.
     */
    @Transactional
    public void markExpired(String orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElse(null);
        if (order == null || order.getStatus() != OrderStatus.CREATED) {
            return;
        }
        order.setStatus(OrderStatus.EXPIRED);
        orderRepository.save(order);
    }

    // ------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------

    private static List<OrderItemData> toEventItems(OrderEntity order) {
        if (order.getItems() == null) return List.of();
        return order.getItems().stream()
                .map(i -> OrderItemData.builder()
                        .productId(i.getProductId())
                        .sellerId(i.getSellerId())
                        .name(i.getName())
                        .imageUrl(i.getImageUrl())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .lineTotal(i.getLineTotal())
                        .build())
                .toList();
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private UserPayload requireUser() {
        UserPayload user = UserContext.getUser();
        if (user == null || user.getId() == null) {
            throw new NotAuthorizedException();
        }
        return user;
    }
}
