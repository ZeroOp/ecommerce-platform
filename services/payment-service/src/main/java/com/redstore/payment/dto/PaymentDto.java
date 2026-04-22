package com.redstore.payment.dto;

import com.redstore.payment.entity.PaymentRecord;
import com.redstore.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentDto(
        String paymentId,
        String orderId,
        PaymentStatus status,
        BigDecimal amount,
        String currency,
        String provider,
        String providerRef,
        Instant orderExpiresAt,
        Instant paidAt
) {
    public static PaymentDto from(PaymentRecord record) {
        return new PaymentDto(
                record.getPaymentId(),
                record.getOrderId(),
                record.getStatus(),
                record.getAmount(),
                record.getCurrency(),
                record.getProvider(),
                record.getProviderRef(),
                record.getOrderExpiresAt(),
                record.getPaidAt()
        );
    }
}
