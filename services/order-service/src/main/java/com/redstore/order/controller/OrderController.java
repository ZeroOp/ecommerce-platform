package com.redstore.order.controller;

import com.redstore.order.dto.CreateOrderRequest;
import com.redstore.order.dto.OrderDto;
import com.redstore.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> myOrders() {
        return ResponseEntity.ok(orderService.listMyOrders());
    }

    @GetMapping("/seller")
    public ResponseEntity<List<OrderDto>> sellerOrders() {
        return ResponseEntity.ok(orderService.listSellerOrders());
    }

    @GetMapping("/admin")
    public ResponseEntity<List<OrderDto>> adminOrders() {
        return ResponseEntity.ok(orderService.listAdminOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> myOrder(@PathVariable("id") String id) {
        return ResponseEntity.ok(orderService.getMyOrder(id));
    }

    @PostMapping
    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<OrderDto> cancel(
            @PathVariable("id") String id,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }

    @PostMapping("/{id}/seller/ship")
    public ResponseEntity<OrderDto> sellerShip(@PathVariable("id") String id) {
        return ResponseEntity.ok(orderService.shipBySeller(id));
    }

    @PostMapping("/{id}/seller/cancel")
    public ResponseEntity<OrderDto> sellerCancel(
            @PathVariable("id") String id,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        return ResponseEntity.ok(orderService.cancelBySeller(id, reason));
    }

    @PostMapping("/{id}/admin/close")
    public ResponseEntity<OrderDto> adminClose(@PathVariable("id") String id) {
        return ResponseEntity.ok(orderService.closeByAdmin(id));
    }

    @PostMapping("/{id}/admin/cancel")
    public ResponseEntity<OrderDto> adminCancel(
            @PathVariable("id") String id,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        return ResponseEntity.ok(orderService.cancelByAdmin(id, reason));
    }
}
