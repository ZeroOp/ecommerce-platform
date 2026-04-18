package com.redstore.inventory.service;

import com.redstore.common.dto.InventoryReleasedEventData;
import com.redstore.common.dto.InventoryReservedEventData;
import com.redstore.common.dto.InventoryStockAddedEventData;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.exceptions.ForbiddenException;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import com.redstore.inventory.client.ProductOwnershipClient;
import com.redstore.inventory.dto.AddStockRequest;
import com.redstore.inventory.dto.InventoryLineDto;
import com.redstore.inventory.dto.OperationResultDto;
import com.redstore.inventory.dto.ReleaseStockRequest;
import com.redstore.inventory.dto.ReserveStockRequest;
import com.redstore.inventory.entity.ProductInventory;
import com.redstore.inventory.entity.StockReservation;
import com.redstore.inventory.events.publishers.InventoryReleasedPublisher;
import com.redstore.inventory.events.publishers.InventoryReservedPublisher;
import com.redstore.inventory.events.publishers.InventoryStockAddedPublisher;
import com.redstore.inventory.repository.ProductInventoryRepository;
import com.redstore.inventory.repository.StockReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class InventoryService {

    private final ProductInventoryRepository inventoryRepository;
    private final StockReservationRepository reservationRepository;
    private final ProductOwnershipClient productOwnershipClient;
    private final InventoryCacheService cacheService;
    private final InventoryStockAddedPublisher stockAddedPublisher;
    private final InventoryReservedPublisher reservedPublisher;
    private final InventoryReleasedPublisher releasedPublisher;

    public InventoryService(
            ProductInventoryRepository inventoryRepository,
            StockReservationRepository reservationRepository,
            ProductOwnershipClient productOwnershipClient,
            InventoryCacheService cacheService,
            InventoryStockAddedPublisher stockAddedPublisher,
            InventoryReservedPublisher reservedPublisher,
            InventoryReleasedPublisher releasedPublisher
    ) {
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
        this.productOwnershipClient = productOwnershipClient;
        this.cacheService = cacheService;
        this.stockAddedPublisher = stockAddedPublisher;
        this.reservedPublisher = reservedPublisher;
        this.releasedPublisher = releasedPublisher;
    }

    public List<InventoryLineDto> listForSeller() {
        String sellerId = requireSellerId();
        return inventoryRepository.findBySellerIdOrderByProductIdAsc(sellerId).stream()
                .map(r -> new InventoryLineDto(r.getProductId(), r.getSellerId(), r.getQuantity()))
                .toList();
    }

    public InventoryLineDto getForSellerProduct(
            String productId,
            String authorizationHeader,
            String cookieHeader
    ) {
        String sellerId = requireSellerId();
        var row = inventoryRepository.findById(productId);
        if (row.isEmpty()) {
            productOwnershipClient.assertSellerOwnsProduct(productId, authorizationHeader, cookieHeader);
            return new InventoryLineDto(productId, sellerId, 0);
        }
        if (!row.get().getSellerId().equals(sellerId)) {
            throw new ForbiddenException("Not your inventory");
        }
        return new InventoryLineDto(row.get().getProductId(), row.get().getSellerId(), row.get().getQuantity());
    }

    @Transactional
    public InventoryLineDto addStock(
            String productId,
            AddStockRequest request,
            String authorizationHeader,
            String cookieHeader
    ) {
        String sellerId = requireSellerId();
        productOwnershipClient.assertSellerOwnsProduct(productId, authorizationHeader, cookieHeader);

        ProductInventory row = inventoryRepository.findById(productId).orElse(null);
        if (row == null) {
            row = ProductInventory.builder()
                    .productId(productId)
                    .sellerId(sellerId)
                    .quantity(0)
                    .build();
        }
        if (!row.getSellerId().equals(sellerId)) {
            throw new ForbiddenException("Not your inventory");
        }

        int added = request.quantity();
        row.setQuantity(row.getQuantity() + added);
        ProductInventory saved = inventoryRepository.save(row);
        cacheService.evict(productId);
        cacheService.cacheQuantity(productId, saved.getQuantity());

        stockAddedPublisher.publish(new InventoryStockAddedEventData(
                saved.getProductId(),
                saved.getSellerId(),
                added,
                saved.getQuantity(),
                Instant.now()
        ));

        return new InventoryLineDto(saved.getProductId(), saved.getSellerId(), saved.getQuantity());
    }

    /**
     * Called by checkout / order service: atomically deduct stock if available.
     */
    @Transactional
    public OperationResultDto reserve(ReserveStockRequest request) {
        String productId = request.productId();
        int quantity = request.quantity();
        String orderRef = request.orderRef();

        var existing = reservationRepository.findByOrderRef(orderRef);
        if (existing.isPresent()) {
            if (existing.get().getReleasedAt() != null) {
                return new OperationResultDto(false, "ALREADY_RELEASED", "Reservation was already released");
            }
            return OperationResultDto.ok();
        }

        int updated = inventoryRepository.decrementIfSufficient(productId, quantity);
        if (updated == 0) {
            return OperationResultDto.insufficientStock();
        }

        ProductInventory inv = inventoryRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Inventory row missing after update"));

        reservationRepository.save(StockReservation.builder()
                .id("rsv-" + UUID.randomUUID())
                .productId(productId)
                .quantity(quantity)
                .orderRef(orderRef)
                .createdAt(Instant.now())
                .releasedAt(null)
                .build());

        cacheService.evict(productId);
        cacheService.cacheQuantity(productId, inv.getQuantity());

        reservedPublisher.publish(new InventoryReservedEventData(
                productId,
                orderRef,
                quantity,
                inv.getQuantity(),
                Instant.now()
        ));

        return OperationResultDto.ok();
    }

    /**
     * Restore stock when payment fails or reservation expires.
     */
    @Transactional
    public OperationResultDto release(ReleaseStockRequest request) {
        String orderRef = request.orderRef();
        var opt = reservationRepository.findByOrderRef(orderRef);
        if (opt.isEmpty()) {
            return OperationResultDto.ok();
        }
        StockReservation r = opt.get();
        if (r.getReleasedAt() != null) {
            return OperationResultDto.ok();
        }

        inventoryRepository.increment(r.getProductId(), r.getQuantity());
        r.setReleasedAt(Instant.now());
        reservationRepository.save(r);

        ProductInventory inv = inventoryRepository.findById(r.getProductId()).orElseThrow();
        cacheService.evict(r.getProductId());
        cacheService.cacheQuantity(r.getProductId(), inv.getQuantity());

        releasedPublisher.publish(new InventoryReleasedEventData(
                r.getProductId(),
                orderRef,
                r.getQuantity(),
                inv.getQuantity(),
                Instant.now()
        ));

        return OperationResultDto.ok();
    }

    /** Public read: hot path for product page (cache-backed). */
    public int getAvailableQuantity(String productId) {
        return cacheService.getCachedQuantity(productId)
                .orElseGet(() -> {
                    int q = inventoryRepository.findById(productId)
                            .map(ProductInventory::getQuantity)
                            .orElse(0);
                    cacheService.cacheQuantity(productId, q);
                    return q;
                });
    }

    /** Batch read for admin / storefront — returns a map of productId → availableQuantity. */
    public java.util.Map<String, Integer> getBatchQuantities(java.util.List<String> productIds) {
        java.util.Map<String, Integer> result = new java.util.LinkedHashMap<>();
        for (String productId : productIds) {
            result.put(productId, getAvailableQuantity(productId));
        }
        return result;
    }

    private String requireSellerId() {
        UserPayload user = UserContext.getUser();
        if (user == null) {
            throw new NotAuthorizedException();
        }
        if (!user.getRoles().contains(UserRole.SELLER)) {
            throw new ForbiddenException("Seller role required");
        }
        return user.getId();
    }
}
