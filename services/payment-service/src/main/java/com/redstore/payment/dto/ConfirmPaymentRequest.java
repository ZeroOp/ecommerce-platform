package com.redstore.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfirmPaymentRequest(
        @NotBlank
        @Pattern(regexp = "card|upi|paypal|apple", flags = Pattern.Flag.CASE_INSENSITIVE)
        String method
) {}
