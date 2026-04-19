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
    BRAND_CREATED("product.brand.created"),
    BRAND_UPDATED("product.brand.updated"),
    BRAND_STATUS_UPDATED("product.brand.status.updated"),
    CATEGORY_CREATED("product.category.created"),

    // Orders
    ORDER_CREATED("order.created"),
    ORDER_CANCELLED("order.cancelled"),
    ORDER_COMPLETED("order.completed"),
    ORDER_EXPIRED("order.expired"),
    ORDER_IN_PROGRESS("order.in_progress"),

    // Deals / Offers
    DEAL_CREATED("deal.created"),
    DEAL_CANCELLED("deal.cancelled"),
    DEAL_EXPIRED("deal.expired"),

    // Payment
    PAYMENT_CREATED("payment.created"),
    PAYMENT_FAILED("payment.failed"),

    // Inventory
    INVENTORY_STOCK_ADDED("inventory.stock.added"),
    INVENTORY_RESERVED("inventory.reserved"),
    INVENTORY_RELEASED("inventory.released");

    private final String value;
}