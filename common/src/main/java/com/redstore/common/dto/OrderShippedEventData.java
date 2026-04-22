package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderShippedEventData {
    private String orderId;
    private String userId;
    private String sellerId;
    private List<OrderItemData> items;
    private Instant shippedAt;
}
