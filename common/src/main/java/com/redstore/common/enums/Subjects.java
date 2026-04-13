package com.redstore.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Subjects {
    // Auth / Identity
    USER_CREATED("identity.user.created"),
    USER_UPDATED("identity.user.updated"),
    USER_LOGIN("identity.user.login"),
    USER_LOGOUT("identity.user.logout"),
    TOKEN_REFRESHED("identity.token.refreshed"),
    
    // Seller specific events
    SELLER_REGISTERED("identity.seller.registered"),
    SELLER_APPROVED("identity.seller.approved"),
    SELLER_REJECTED("identity.seller.rejected"),
    SELLER_LOGIN("identity.seller.login"),
    
    // Admin specific events
    ADMIN_LOGIN("identity.admin.login"),
    
    // Product
    PRODUCT_CREATED("product.created"),
    PRODUCT_UPDATED("product.updated"),

    // Orders (Saga Pattern)
    ORDER_CREATED("order.created"),
    ORDER_CANCELLED("order.cancelled"),

    // Payment
    PAYMENT_CREATED("payment.created"),
    PAYMENT_FAILED("payment.failed");

    private final String value;
}