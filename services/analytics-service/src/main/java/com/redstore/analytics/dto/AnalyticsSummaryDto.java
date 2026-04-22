package com.redstore.analytics.dto;

import lombok.Builder;

@Builder
public record AnalyticsSummaryDto(
        long totalOrders,
        long pendingCount,
        long inProgressCount,
        long shippedCount,
        long completedCount,
        long cancelledCount,
        double grossRevenue
) {
}
