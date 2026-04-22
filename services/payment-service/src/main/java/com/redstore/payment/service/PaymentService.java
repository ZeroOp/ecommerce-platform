package com.redstore.payment.service;

import com.redstore.common.dto.OrderCreatedEventData;
import com.redstore.common.dto.OrderItemData;
import com.redstore.common.dto.PaymentOrderCompleteEventData;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import com.redstore.payment.client.OrderReadClient;
import com.redstore.payment.dto.OrderItemSnapshotDto;
import com.redstore.payment.dto.OrderSnapshotDto;
import com.redstore.payment.dto.PaymentDto;
import com.redstore.payment.entity.PaymentRecord;
import com.redstore.payment.entity.PaymentStatus;
import com.redstore.payment.events.publishers.PaymentOrderCompletePublisher;
import com.redstore.payment.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentOrderCompletePublisher completePublisher;
    private final OrderReadClient orderReadClient;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentOrderCompletePublisher completePublisher,
            OrderReadClient orderReadClient
    ) {
        this.paymentRepository = paymentRepository;
        this.completePublisher = completePublisher;
        this.orderReadClient = orderReadClient;
    }

    public void upsertOrderCreated(OrderCreatedEventData event) {
        if (event == null || event.getOrderId() == null) return;
        PaymentRecord existing = paymentRepository.findByOrderId(event.getOrderId()).orElse(null);
        Instant now = Instant.now();
        PaymentRecord record = (existing == null ? PaymentRecord.builder()
                .paymentId("pay-" + UUID.randomUUID())
                .orderId(event.getOrderId())
                .createdAt(now)
                : existing.toBuilder())
                .userId(event.getUserId())
                .userEmail(event.getUserEmail())
                .amount(event.getSubtotal() != null ? event.getSubtotal() : BigDecimal.ZERO)
                .currency("USD")
                .orderExpiresAt(event.getExpiresAt())
                .status(existing != null && existing.getStatus() == PaymentStatus.PAID ? PaymentStatus.PAID : PaymentStatus.AWAITING_PAYMENT)
                .updatedAt(now)
                .build();
        paymentRepository.save(record);
    }

    public void markOrderExpired(String orderId) {
        PaymentRecord existing = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existing == null || existing.getStatus() == PaymentStatus.PAID) return;
        paymentRepository.save(existing.toBuilder()
                .status(PaymentStatus.EXPIRED)
                .updatedAt(Instant.now())
                .build());
    }

    public PaymentDto getByOrderId(String orderId, HttpServletRequest request) {
        UserPayload user = requireUser();
        ensurePaymentRecord(orderId, request, user);
        PaymentRecord r = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BadRequestException("Payment record not found for this order"));
        if (!user.getId().equals(r.getUserId())) throw new NotAuthorizedException();
        return PaymentDto.from(r);
    }

    public PaymentDto confirm(String orderId, String method, HttpServletRequest request) {
        UserPayload user = requireUser();
        ensurePaymentRecord(orderId, request, user);
        PaymentRecord r = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BadRequestException("Payment window not found for order"));
        if (!user.getId().equals(r.getUserId())) throw new NotAuthorizedException();
        if (r.getStatus() == PaymentStatus.PAID) return PaymentDto.from(r);
        if (r.getStatus() == PaymentStatus.EXPIRED || (r.getOrderExpiresAt() != null && Instant.now().isAfter(r.getOrderExpiresAt()))) {
            PaymentRecord expired = paymentRepository.save(r.toBuilder()
                    .status(PaymentStatus.EXPIRED)
                    .updatedAt(Instant.now())
                    .build());
            throw new BadRequestException("Order expired. Payment is no longer accepted.");
        }
        // Guard against event-delivery lag: do not accept payment when order-service
        // has already transitioned this order to a terminal non-payable state.
        String cookie = request.getHeader("Cookie");
        OrderSnapshotDto snap = orderReadClient.fetchOrder(orderId, cookie);
        if (snap == null) {
            throw new BadRequestException("Unable to verify order state for payment");
        }
        if (!user.getId().equals(snap.userId())) {
            throw new NotAuthorizedException();
        }
        String orderStatus = snap.status() == null ? "" : snap.status().trim().toUpperCase();
        if ("EXPIRED".equals(orderStatus)) {
            paymentRepository.save(r.toBuilder()
                    .status(PaymentStatus.EXPIRED)
                    .updatedAt(Instant.now())
                    .build());
            throw new BadRequestException("Order expired. Payment is no longer accepted.");
        }
        if ("CANCELLED".equals(orderStatus) || "COMPLETED".equals(orderStatus)) {
            throw new BadRequestException("Order is not payable in its current state.");
        }

        Instant paidAt = Instant.now();
        PaymentRecord paid = paymentRepository.save(r.toBuilder()
                .status(PaymentStatus.PAID)
                .provider("STRIPE")
                .providerRef("pi_test_" + UUID.randomUUID())
                .paidAt(paidAt)
                .updatedAt(paidAt)
                .build());

        completePublisher.publish(PaymentOrderCompleteEventData.builder()
                .paymentId(paid.getPaymentId())
                .orderId(paid.getOrderId())
                .userId(paid.getUserId())
                .userEmail(paid.getUserEmail())
                .provider(paid.getProvider())
                .providerRef(paid.getProviderRef())
                .amount(paid.getAmount())
                .currency(paid.getCurrency())
                .paidAt(paidAt)
                .build());
        return PaymentDto.from(paid);
    }

    private UserPayload requireUser() {
        UserPayload user = UserContext.getUser();
        if (user == null || user.getId() == null) throw new NotAuthorizedException();
        return user;
    }

    /**
     * Payment rows are normally created from {@code order.created} JetStream messages, but the
     * browser can hit this API before that message is processed. In that case we pull the
     * order from order-service (same user session) and upsert idempotently.
     */
    private void ensurePaymentRecord(String orderId, HttpServletRequest request, UserPayload user) {
        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            return;
        }
        String cookie = request.getHeader("Cookie");
        OrderSnapshotDto snap = orderReadClient.fetchOrder(orderId, cookie);
        if (snap == null) {
            throw new BadRequestException("Payment record not found for this order");
        }
        if (!user.getId().equals(snap.userId())) {
            throw new NotAuthorizedException();
        }
        List<OrderItemData> items = snap.items() == null ? List.of()
                : snap.items().stream().map(this::toOrderItemData).toList();
        upsertOrderCreated(OrderCreatedEventData.builder()
                .orderId(snap.id())
                .userId(snap.userId())
                .userEmail(snap.userEmail())
                .items(items)
                .subtotal(snap.subtotal())
                .createdAt(snap.createdAt())
                .expiresAt(snap.expiresAt())
                .build());
    }

    private OrderItemData toOrderItemData(OrderItemSnapshotDto i) {
        return OrderItemData.builder()
                .productId(i.productId())
                .sellerId(i.sellerId())
                .name(i.name())
                .imageUrl(i.imageUrl())
                .quantity(i.quantity())
                .unitPrice(i.unitPrice())
                .lineTotal(i.lineTotal())
                .build();
    }
}
