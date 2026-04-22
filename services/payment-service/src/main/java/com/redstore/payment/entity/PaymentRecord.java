package com.redstore.payment.entity;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder(toBuilder = true)
public class PaymentRecord {
    String paymentId;
    String orderId;
    String userId;
    String userEmail;
    BigDecimal amount;
    String currency;
    Instant orderExpiresAt;
    PaymentStatus status;
    String provider;
    String providerRef;
    Instant paidAt;
    Instant createdAt;
    Instant updatedAt;
}
