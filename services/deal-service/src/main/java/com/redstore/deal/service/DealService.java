package com.redstore.deal.service;

import com.redstore.common.dto.DealCancelledEventData;
import com.redstore.common.dto.DealCreatedEventData;
import com.redstore.common.dto.DealExpiredEventData;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import com.redstore.deal.dto.BestDealDto;
import com.redstore.deal.dto.CreateDealRequest;
import com.redstore.deal.dto.DealDto;
import com.redstore.deal.entity.*;
import com.redstore.deal.events.publishers.DealCancelledPublisher;
import com.redstore.deal.events.publishers.DealCreatedPublisher;
import com.redstore.deal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class DealService {

    private final DealRepository dealRepository;
    private final ProductReplicaRepository productReplicaRepository;
    private final BrandReplicaRepository brandReplicaRepository;
    private final DealCreatedPublisher dealCreatedPublisher;
    private final DealCancelledPublisher dealCancelledPublisher;

    public DealService(
            DealRepository dealRepository,
            ProductReplicaRepository productReplicaRepository,
            BrandReplicaRepository brandReplicaRepository,
            DealCreatedPublisher dealCreatedPublisher,
            DealCancelledPublisher dealCancelledPublisher
    ) {
        this.dealRepository = dealRepository;
        this.productReplicaRepository = productReplicaRepository;
        this.brandReplicaRepository = brandReplicaRepository;
        this.dealCreatedPublisher = dealCreatedPublisher;
        this.dealCancelledPublisher = dealCancelledPublisher;
    }

    @Transactional
    public DealDto create(CreateDealRequest req) {
        String sellerId = requireSellerId();
        Instant now = Instant.now();
        Instant startsAt = req.startsAt() != null ? req.startsAt() : now;
        if (!req.expiresAt().isAfter(startsAt)) {
            throw new BadRequestException("expiresAt must be after startsAt");
        }

        String targetId = resolveAndValidateTarget(req, sellerId);

        DealEntity deal = DealEntity.builder()
                .id("deal-" + UUID.randomUUID())
                .sellerId(sellerId)
                .scope(req.scope())
                .targetId(targetId)
                .discountPercentage(req.discountPercentage())
                .title(req.title().trim())
                .startsAt(startsAt)
                .expiresAt(req.expiresAt())
                .status(DealStatus.ACTIVE)
                .createdAt(now)
                .build();
        DealEntity saved = dealRepository.save(deal);

        dealCreatedPublisher.publish(DealCreatedEventData.builder()
                .dealId(saved.getId())
                .scope(saved.getScope().name())
                .productId(saved.getScope() == DealScope.PRODUCT ? saved.getTargetId() : null)
                .brandId(saved.getScope() == DealScope.BRAND ? saved.getTargetId() : null)
                .categoryId(saved.getScope() == DealScope.CATEGORY ? saved.getTargetId() : null)
                .sellerId(saved.getSellerId())
                .discountPercentage(saved.getDiscountPercentage())
                .title(saved.getTitle())
                .startsAt(saved.getStartsAt())
                .expiresAt(saved.getExpiresAt())
                .createdAt(saved.getCreatedAt())
                .build());

        return DealDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<DealDto> listMine() {
        String sellerId = requireSellerId();
        return dealRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream().map(DealDto::from).toList();
    }

    @Transactional
    public DealDto cancelMine(String dealId) {
        String sellerId = requireSellerId();
        DealEntity deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new BadRequestException("Deal not found"));
        if (!sellerId.equals(deal.getSellerId())) {
            throw new NotAuthorizedException();
        }
        if (deal.getStatus() != DealStatus.ACTIVE) {
            return DealDto.from(deal);
        }
        deal.setStatus(DealStatus.CANCELLED);
        deal.setCancelledAt(Instant.now());
        DealEntity saved = dealRepository.save(deal);

        dealCancelledPublisher.publish(DealCancelledEventData.builder()
                .dealId(saved.getId())
                .scope(saved.getScope().name())
                .productId(saved.getScope() == DealScope.PRODUCT ? saved.getTargetId() : null)
                .brandId(saved.getScope() == DealScope.BRAND ? saved.getTargetId() : null)
                .categoryId(saved.getScope() == DealScope.CATEGORY ? saved.getTargetId() : null)
                .sellerId(saved.getSellerId())
                .cancelledAt(saved.getCancelledAt())
                .build());

        return DealDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<BestDealDto> bestDealsByProductIds(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) return List.of();
        Instant now = Instant.now();

        Map<String, ProductReplica> products = new HashMap<>();
        for (String productId : new LinkedHashSet<>(productIds)) {
            if (productId == null || productId.isBlank()) continue;
            productReplicaRepository.findById(productId).ifPresent(p -> products.put(productId, p));
        }
        if (products.isEmpty()) return List.of();

        List<DealEntity> active = dealRepository.findByStatusAndStartsAtLessThanEqualAndExpiresAtGreaterThan(
                DealStatus.ACTIVE, now, now
        );
        Map<String, DealEntity> bestByProduct = new HashMap<>();
        for (Map.Entry<String, ProductReplica> e : products.entrySet()) {
            String productId = e.getKey();
            ProductReplica p = e.getValue();
            DealEntity best = null;
            for (DealEntity deal : active) {
                if (matches(deal, p)) {
                    if (best == null || deal.getDiscountPercentage().compareTo(best.getDiscountPercentage()) > 0) {
                        best = deal;
                    }
                }
            }
            if (best != null) bestByProduct.put(productId, best);
        }

        List<BestDealDto> out = new ArrayList<>();
        for (Map.Entry<String, DealEntity> e : bestByProduct.entrySet()) {
            DealEntity d = e.getValue();
            out.add(new BestDealDto(e.getKey(), d.getId(), d.getScope(), d.getDiscountPercentage(), d.getExpiresAt()));
        }
        return out;
    }

    @Transactional
    public void markExpired(DealExpiredEventData data) {
        if (data == null || data.getDealId() == null) return;
        DealEntity deal = dealRepository.findById(data.getDealId()).orElse(null);
        if (deal == null || deal.getStatus() != DealStatus.ACTIVE) return;
        deal.setStatus(DealStatus.EXPIRED);
        deal.setExpiredAt(data.getExpiredAt() != null ? data.getExpiredAt() : Instant.now());
        dealRepository.save(deal);
    }

    private String resolveAndValidateTarget(CreateDealRequest req, String sellerId) {
        return switch (req.scope()) {
            case SELLER -> null;
            case PRODUCT -> {
                String productId = required(req.productId(), "productId is required for PRODUCT scope");
                ProductReplica p = productReplicaRepository.findById(productId)
                        .orElseThrow(() -> new BadRequestException("Unknown product (replica not synced yet, retry in a few seconds)"));
                if (!sellerId.equals(p.getSellerId())) throw new BadRequestException("You can only deal your own products");
                yield productId;
            }
            case BRAND -> {
                String brandId = required(req.brandId(), "brandId is required for BRAND scope");
                BrandReplica b = brandReplicaRepository.findById(brandId)
                        .orElseThrow(() -> new BadRequestException("Unknown brand (replica not synced yet, retry in a few seconds)"));
                if (!sellerId.equals(b.getSellerId())) throw new BadRequestException("You can only deal your own brands");
                yield brandId;
            }
            case CATEGORY -> {
                // Sellers may run promos on any catalog category; enforcement is only that the
                // category id is present — matching at read time uses each product's categoryId.
                yield required(req.categoryId(), "categoryId is required for CATEGORY scope");
            }
        };
    }

    private boolean matches(DealEntity deal, ProductReplica p) {
        return switch (deal.getScope()) {
            case SELLER -> Objects.equals(deal.getSellerId(), p.getSellerId());
            case PRODUCT -> Objects.equals(deal.getTargetId(), p.getProductId());
            case BRAND -> Objects.equals(deal.getTargetId(), p.getBrandId());
            case CATEGORY -> Objects.equals(deal.getTargetId(), p.getCategoryId());
        };
    }

    private static String required(String value, String message) {
        if (value == null || value.isBlank()) throw new BadRequestException(message);
        return value;
    }

    private String requireSellerId() {
        var user = UserContext.getUser();
        if (user == null || user.getId() == null) throw new NotAuthorizedException();
        return user.getId();
    }
}
