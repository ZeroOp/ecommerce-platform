package com.redstore.inventory.controller;

import com.redstore.inventory.dto.OperationResultDto;
import com.redstore.inventory.dto.ReleaseStockRequest;
import com.redstore.inventory.dto.ReserveStockRequest;
import com.redstore.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/internal")
public class InternalInventoryController {

    private final InventoryService inventoryService;

    public InternalInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/reserve")
    public OperationResultDto reserve(@Valid @RequestBody ReserveStockRequest request) {
        return inventoryService.reserve(request);
    }

    @PostMapping("/release")
    public OperationResultDto release(@Valid @RequestBody ReleaseStockRequest request) {
        return inventoryService.release(request);
    }
}
