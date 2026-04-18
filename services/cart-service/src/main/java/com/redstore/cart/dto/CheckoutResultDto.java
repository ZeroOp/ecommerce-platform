package com.redstore.cart.dto;

import java.util.List;

public record CheckoutResultDto(
        boolean ok,
        String orderRef,
        List<CheckoutIssueDto> issues,
        CartDto cart
) {
    public static CheckoutResultDto ok(String orderRef, CartDto cart) {
        return new CheckoutResultDto(true, orderRef, List.of(), cart);
    }

    public static CheckoutResultDto blocked(List<CheckoutIssueDto> issues, CartDto cart) {
        return new CheckoutResultDto(false, null, issues, cart);
    }
}
