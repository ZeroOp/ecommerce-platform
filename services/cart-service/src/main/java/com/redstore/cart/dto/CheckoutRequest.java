package com.redstore.cart.dto;

/**
 * Optional body for POST /api/cart/checkout. When {@code dryRun} is true the
 * cart is only validated against inventory; no reservation is taken and the
 * cart is left untouched.
 */
public record CheckoutRequest(boolean dryRun) {}
