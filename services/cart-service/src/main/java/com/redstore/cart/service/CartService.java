package com.redstore.cart.service;

import com.redstore.cart.client.InventoryClient;
import com.redstore.cart.dto.AddItemRequest;
import com.redstore.cart.dto.CartDto;
import com.redstore.cart.dto.CartItemDto;
import com.redstore.cart.dto.CheckoutIssueDto;
import com.redstore.cart.dto.CheckoutResultDto;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository repository;
    private final InventoryClient inventoryClient;

    public CartService(CartRepository repository, InventoryClient inventoryClient) {
        this.repository = repository;
        this.inventoryClient = inventoryClient;
    }

    public CartDto getCart() {
        String userId = requireUserId();
        return buildCart(userId, repository.loadAll(userId), /*enrich*/ true);
    }

    public CartDto addItem(AddItemRequest request) {
        String userId = requireUserId();
        int requested = request.quantity();

        CartItemDto existing = repository.get(userId, request.productId());
        int totalWanted = (existing != null ? existing.quantity() : 0) + requested;

        int available = resolveAvailable(request.productId());
        if (totalWanted > available) {
            throw new BadRequestException(
                    "Only " + available + " unit(s) of this product are in stock."
            );
        }

        CartItemDto merged = new CartItemDto(
                request.productId(),
                totalWanted,
                firstNonNull(request.name(),   existing != null ? existing.name() : null),
                firstNonNull(request.brand(),  existing != null ? existing.brand() : null),
                firstNonNull(request.image(),  existing != null ? existing.image() : null),
                firstNonNull(request.price(),  existing != null ? existing.price() : null),
                firstNonNull(request.originalPrice(), existing != null ? existing.originalPrice() : null),
                firstNonNull(request.slug(),   existing != null ? existing.slug() : null),
                available,
                existing != null && existing.addedAt() != null ? existing.addedAt() : Instant.now()
        );
        repository.put(userId, merged);

        return getCart();
    }

    public CartDto updateQuantity(String productId, int quantity) {
        String userId = requireUserId();
        CartItemDto existing = repository.get(userId, productId);
        if (existing == null) {
            throw new BadRequestException("Item not in cart");
        }
        if (quantity <= 0) {
            repository.remove(userId, productId);
            return getCart();
        }

        int available = resolveAvailable(productId);
        if (quantity > available) {
            throw new BadRequestException(
                    "Only " + available + " unit(s) in stock — can't set quantity to " + quantity + "."
            );
        }
        repository.put(userId, new CartItemDto(
                existing.productId(),
                quantity,
                existing.name(),
                existing.brand(),
                existing.image(),
                existing.price(),
                existing.originalPrice(),
                existing.slug(),
                available,
                existing.addedAt() != null ? existing.addedAt() : Instant.now()
        ));
        return getCart();
    }

    public CartDto removeItem(String productId) {
        String userId = requireUserId();
        repository.remove(userId, productId);
        return getCart();
    }

    public CartDto clear() {
        String userId = requireUserId();
        repository.clear(userId);
        return buildCart(userId, List.of(), /*enrich*/ false);
    }

    public CheckoutResultDto checkout(boolean dryRun) {
        String userId = requireUserId();
        List<CartItemDto> items = repository.loadAll(userId);
        if (items.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Map<String, Integer> quantities = inventoryClient.getBatchQuantities(
                items.stream().map(CartItemDto::productId).toList()
        );

        List<CheckoutIssueDto> issues = new ArrayList<>();
        for (CartItemDto it : items) {
            int available = quantities.getOrDefault(it.productId(), 0);
            if (it.quantity() > available) {
                issues.add(new CheckoutIssueDto(
                        it.productId(),
                        it.name(),
                        it.quantity(),
                        available,
                        available == 0 ? "OUT_OF_STOCK" : "INSUFFICIENT_STOCK"
                ));
            }
        }

        CartDto enriched = buildCart(userId, items, quantities);
        if (!issues.isEmpty()) {
            return CheckoutResultDto.blocked(issues, enriched);
        }
        if (dryRun) {
            return CheckoutResultDto.ok("dry-run", enriched);
        }

        String orderRef = "ord-" + UUID.randomUUID();
        List<String> reserved = new ArrayList<>();
        for (CartItemDto it : items) {
            String perItemRef = orderRef + ":" + it.productId();
            InventoryClient.ReserveOutcome outcome = inventoryClient.reserve(
                    it.productId(), it.quantity(), perItemRef
            );
            if (!outcome.success()) {
                for (String ref : reserved) {
                    inventoryClient.release(ref);
                }
                issues.add(new CheckoutIssueDto(
                        it.productId(),
                        it.name(),
                        it.quantity(),
                        quantities.getOrDefault(it.productId(), 0),
                        outcome.code() != null ? outcome.code() : "RESERVE_FAILED"
                ));
                return CheckoutResultDto.blocked(issues, enriched);
            }
            reserved.add(perItemRef);
        }

        repository.clear(userId);
        return CheckoutResultDto.ok(orderRef, buildCart(userId, List.of(), /*enrich*/ false));
    }

    // ---------------- helpers ----------------

    private CartDto buildCart(String userId, List<CartItemDto> items, boolean enrich) {
        Map<String, Integer> availability = Map.of();
        if (enrich && !items.isEmpty()) {
            try {
                availability = inventoryClient.getBatchQuantities(
                        items.stream().map(CartItemDto::productId).toList()
                );
            } catch (Exception e) {
                availability = Map.of();
            }
        }
        return buildCart(userId, items, availability);
    }

    private CartDto buildCart(String userId, List<CartItemDto> items, Map<String, Integer> availability) {
        List<CartItemDto> decorated = new ArrayList<>(items.size());
        int totalItems = 0;
        double subtotal = 0;
        for (CartItemDto item : items) {
            Integer available = availability.get(item.productId());
            if (available == null) {
                available = item.availableQuantity();
            }
            decorated.add(new CartItemDto(
                    item.productId(),
                    item.quantity(),
                    item.name(),
                    item.brand(),
                    item.image(),
                    item.price(),
                    item.originalPrice(),
                    item.slug(),
                    available,
                    item.addedAt()
            ));
            totalItems += item.quantity();
            if (item.price() != null) {
                subtotal += item.price() * item.quantity();
            }
        }
        return new CartDto(userId, decorated, totalItems, round2(subtotal));
    }

    private int resolveAvailable(String productId) {
        try {
            Map<String, Integer> map = inventoryClient.getBatchQuantities(List.of(productId));
            return map.getOrDefault(productId, 0);
        } catch (Exception e) {
            // If inventory service is temporarily unreachable, allow the add
            // but cap it via the downstream checkout validation.
            return Integer.MAX_VALUE;
        }
    }

    private static <T> T firstNonNull(T a, T b) {
        return a != null ? a : b;
    }

    private static double round2(double d) {
        return Math.round(d * 100d) / 100d;
    }

    private String requireUserId() {
        UserPayload user = UserContext.getUser();
        if (user == null || user.getId() == null) {
            throw new NotAuthorizedException();
        }
        return user.getId();
    }
}
