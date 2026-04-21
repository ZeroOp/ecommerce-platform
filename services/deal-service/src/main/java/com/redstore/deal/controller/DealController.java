package com.redstore.deal.controller;

import com.redstore.common.annotations.RequireSeller;
import com.redstore.deal.dto.BestDealDto;
import com.redstore.deal.dto.CreateDealRequest;
import com.redstore.deal.dto.DealDto;
import com.redstore.deal.service.DealService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private final DealService dealService;

    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    @RequireSeller
    @PostMapping
    public ResponseEntity<DealDto> create(@Valid @RequestBody CreateDealRequest request) {
        return ResponseEntity.ok(dealService.create(request));
    }

    @RequireSeller
    @GetMapping("/my")
    public ResponseEntity<List<DealDto>> myDeals() {
        return ResponseEntity.ok(dealService.listMine());
    }

    @RequireSeller
    @PostMapping("/{dealId}/cancel")
    public ResponseEntity<DealDto> cancel(@PathVariable String dealId) {
        return ResponseEntity.ok(dealService.cancelMine(dealId));
    }

    @GetMapping("/public/best-by-products")
    public ResponseEntity<List<BestDealDto>> bestByProducts(@RequestParam("productIds") List<String> productIds) {
        return ResponseEntity.ok(dealService.bestDealsByProductIds(productIds));
    }
}
