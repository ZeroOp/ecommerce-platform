package com.redstore.analytics.controller;

import com.redstore.analytics.dto.AnalyticsSummaryDto;
import com.redstore.analytics.service.OrderAnalyticsQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final OrderAnalyticsQueryService queryService;

    public AnalyticsController(OrderAnalyticsQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/seller/summary")
    public AnalyticsSummaryDto sellerSummary() {
        return queryService.sellerSummary();
    }

    @GetMapping("/admin/summary")
    public AnalyticsSummaryDto adminSummary() {
        return queryService.adminSummary();
    }
}
