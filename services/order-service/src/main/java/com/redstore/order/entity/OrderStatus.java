package com.redstore.order.entity;

/**
 * Lifecycle:
 * <pre>
 *   CREATED ──► IN_PROGRESS ──► SHIPPED ──► COMPLETED
 *     │             │
 *     ├─► CANCELLED ┘
 *     └─► EXPIRED   (auto-transition by scheduler if stale)
 * </pre>
 *
 * CREATED: order placed, stock reservation requested from inventory.
 * IN_PROGRESS: payment-service has accepted payment; fulfilment in progress.
 * SHIPPED: seller has dispatched the order for delivery.
 * COMPLETED: admin has closed the shipped order lifecycle.
 * CANCELLED: user or system cancelled. Inventory releases reservation.
 * EXPIRED: order sat in CREATED past {@code order.expiry.minutes}. Inventory releases.
 */
public enum OrderStatus {
    CREATED,
    IN_PROGRESS,
    SHIPPED,
    COMPLETED,
    CANCELLED,
    EXPIRED
}
