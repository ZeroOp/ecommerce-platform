package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderCompleteEventData {
    private String paymentId;
    private String orderId;
    private String userId;
    private String userEmail;
    private String provider;
    private String providerRef;
    private BigDecimal amount;
    private String currency;
    private Instant paidAt;
}
