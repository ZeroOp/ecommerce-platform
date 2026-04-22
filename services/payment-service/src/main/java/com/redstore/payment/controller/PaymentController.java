package com.redstore.payment.controller;

import com.redstore.payment.dto.ConfirmPaymentRequest;
import com.redstore.payment.dto.PaymentDto;
import com.redstore.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/orders/{orderId}")
    public PaymentDto byOrder(@PathVariable String orderId, HttpServletRequest httpRequest) {
        return paymentService.getByOrderId(orderId, httpRequest);
    }

    @PostMapping("/orders/{orderId}/confirm")
    public PaymentDto confirm(
            @PathVariable String orderId,
            @Valid @RequestBody ConfirmPaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        return paymentService.confirm(orderId, request.method(), httpRequest);
    }
}
