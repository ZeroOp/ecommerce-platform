package com.redstore.expiration.entity;

/**
 * Discriminator for an expiration job — determines which NATS subject we
 * publish on when the job fires.
 */
public enum ExpirationType {
    /** Fires {@code order.expired} on the ORDERS stream. */
    ORDER,
    /** Fires {@code deal.expired} on the DEALS stream. */
    DEAL
}
