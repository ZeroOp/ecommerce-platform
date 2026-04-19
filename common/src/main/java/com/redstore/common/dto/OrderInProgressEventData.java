package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Broadcast on {@code order.in_progress} when payment-service flips the order
 * from CREATED to IN_PROGRESS (it has accepted the payment and is working on
 * fulfilment). Currently unused by other services but reserved so the contract
 * exists when payment-service lands.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderInProgressEventData {
    private String orderId;
    private String userId;
    private String paymentRef;
    private Instant updatedAt;
}
