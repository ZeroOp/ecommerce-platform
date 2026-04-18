package com.redstore.cart.controller;

import com.redstore.cart.dto.AddItemRequest;
import com.redstore.cart.dto.CartDto;
import com.redstore.cart.dto.CheckoutRequest;
import com.redstore.cart.dto.CheckoutResultDto;
import com.redstore.cart.dto.UpdateQuantityRequest;
import com.redstore.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartDto getCart() {
        return cartService.getCart();
    }

    @PostMapping("/items")
    public CartDto addItem(@Valid @RequestBody AddItemRequest request) {
        return cartService.addItem(request);
    }

    @PatchMapping("/items/{productId}")
    public CartDto updateItem(
            @PathVariable("productId") String productId,
            @Valid @RequestBody UpdateQuantityRequest request
    ) {
        return cartService.updateQuantity(productId, request.quantity());
    }

    @DeleteMapping("/items/{productId}")
    public CartDto removeItem(@PathVariable("productId") String productId) {
        return cartService.removeItem(productId);
    }

    @DeleteMapping
    public CartDto clear() {
        return cartService.clear();
    }

    @PostMapping("/checkout")
    public CheckoutResultDto checkout(@RequestBody(required = false) CheckoutRequest request) {
        boolean dryRun = request != null && request.dryRun();
        return cartService.checkout(dryRun);
    }
}
