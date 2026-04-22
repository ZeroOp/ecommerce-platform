package com.redstore.analytics.service;

import com.redstore.analytics.dto.AnalyticsSummaryDto;
import com.redstore.analytics.repository.OrderAnalyticsRepository;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import org.springframework.stereotype.Service;

@Service
public class OrderAnalyticsQueryService {

    private final OrderAnalyticsRepository repository;

    public OrderAnalyticsQueryService(OrderAnalyticsRepository repository) {
        this.repository = repository;
    }

    public AnalyticsSummaryDto sellerSummary() {
        UserPayload seller = requireRole(UserRole.SELLER);
        return repository.summaryForSeller(seller.getId());
    }

    public AnalyticsSummaryDto adminSummary() {
        requireRole(UserRole.ADMIN);
        return repository.summaryForAdmin();
    }

    private UserPayload requireRole(UserRole role) {
        UserPayload user = UserContext.getUser();
        if (user == null || user.getId() == null || user.getRoles() == null || !user.getRoles().contains(role)) {
            throw new NotAuthorizedException();
        }
        return user;
    }
}
