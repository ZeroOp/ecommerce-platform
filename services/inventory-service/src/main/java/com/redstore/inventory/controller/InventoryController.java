package com.redstore.inventory.controller;

import com.redstore.common.annotations.RequireSeller;
import com.redstore.inventory.dto.AddStockRequest;
import com.redstore.inventory.dto.InventoryLineDto;
import com.redstore.inventory.dto.PublicQuantityDto;
import com.redstore.inventory.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/seller")
    @RequireSeller
    public List<InventoryLineDto> listSellerInventory() {
        return inventoryService.listForSeller();
    }

    @GetMapping("/seller/products/{productId}")
    @RequireSeller
    public InventoryLineDto getSellerProductInventory(
            @PathVariable("productId") String productId,
            HttpServletRequest request
    ) {
        return inventoryService.getForSellerProduct(
                productId,
                request.getHeader(HttpHeaders.AUTHORIZATION),
                request.getHeader(HttpHeaders.COOKIE)
        );
    }

    @PostMapping("/seller/products/{productId}/add-stock")
    @RequireSeller
    public InventoryLineDto addStock(
            @PathVariable("productId") String productId,
            @Valid @RequestBody AddStockRequest body,
            HttpServletRequest request
    ) {
        return inventoryService.addStock(
                productId,
                body,
                request.getHeader(HttpHeaders.AUTHORIZATION),
                request.getHeader(HttpHeaders.COOKIE)
        );
    }

    /** Storefront / read model: cached quantity (defaults to 0 if never stocked). */
    @GetMapping("/public/products/{productId}/quantity")
    public PublicQuantityDto publicQuantity(@PathVariable("productId") String productId) {
        int q = inventoryService.getAvailableQuantity(productId);
        return new PublicQuantityDto(productId, q);
    }

    /**
     * Batch quantity lookup — accepts a comma-separated list of productIds.
     * Returns a map of productId → availableQuantity.
     * Public endpoint; no auth required.
     */
    @GetMapping("/public/quantities")
    public Map<String, Integer> batchQuantities(
            @RequestParam("productIds") List<String> productIds
    ) {
        return inventoryService.getBatchQuantities(productIds);
    }
}
