package com.redstore.search.service;

import com.redstore.common.dto.ProductCreatedEventData;
import com.redstore.search.dto.ProductDoc;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.mapping.Property;
import org.opensearch.client.opensearch._types.mapping.TypeMapping;
import org.opensearch.client.opensearch.core.IndexRequest;
import org.opensearch.client.opensearch.indices.CreateIndexRequest;
import org.opensearch.client.opensearch.indices.ExistsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Owns the lifecycle of the {@code products} index in OpenSearch: creates the
 * index with a tuned mapping on startup and exposes a small API for the NATS
 * consumer to upsert documents as events flow in.
 */
@Slf4j
@Service
public class ProductIndexService {

    private final OpenSearchClient client;

    @Value("${search.products.index}")
    private String indexName;

    public ProductIndexService(OpenSearchClient client) {
        this.client = client;
    }

    @PostConstruct
    public void ensureIndex() {
        try {
            boolean exists = client.indices().exists(ExistsRequest.of(e -> e.index(indexName))).value();
            if (exists) {
                log.info("search-service: index '{}' already exists", indexName);
                return;
            }
            Map<String, Property> properties = new HashMap<>();
            properties.put("productId", Property.of(p -> p.keyword(k -> k)));
            properties.put("sellerId", Property.of(p -> p.keyword(k -> k)));
            properties.put("brandId", Property.of(p -> p.keyword(k -> k)));
            properties.put("brandName", Property.of(p -> p.text(t -> t.analyzer("standard").fields(
                    Map.of("keyword", Property.of(kp -> kp.keyword(k -> k)))
            ))));
            properties.put("categoryId", Property.of(p -> p.keyword(k -> k)));
            properties.put("categorySlug", Property.of(p -> p.keyword(k -> k)));
            properties.put("categoryName", Property.of(p -> p.text(t -> t.analyzer("standard"))));
            properties.put("slug", Property.of(p -> p.keyword(k -> k)));
            properties.put("name", Property.of(p -> p.text(t -> t.analyzer("standard"))));
            properties.put("description", Property.of(p -> p.text(t -> t.analyzer("standard"))));
            properties.put("price", Property.of(p -> p.scaledFloat(f -> f.scalingFactor(100.0))));
            properties.put("imageUrls", Property.of(p -> p.keyword(k -> k)));
            properties.put("createdAt", Property.of(p -> p.date(d -> d)));
            properties.put("indexedAt", Property.of(p -> p.date(d -> d)));
            // Keep metadata as a dynamic object so we do not force a template.
            properties.put("metadata", Property.of(p -> p.object(o -> o.enabled(true))));

            TypeMapping mapping = TypeMapping.of(m -> m.properties(properties));
            CreateIndexRequest request = CreateIndexRequest.of(c -> c
                    .index(indexName)
                    .mappings(mapping)
            );
            client.indices().create(request);
            log.info("search-service: created index '{}'", indexName);
        } catch (Exception e) {
            // Non-fatal: the consumer will retry on write if the index is missing.
            log.error("search-service: failed to initialise index '{}': {}", indexName, e.getMessage(), e);
        }
    }

    public void indexFromCreatedEvent(ProductCreatedEventData event) throws IOException {
        if (event == null || event.getProductId() == null) {
            return;
        }
        ProductDoc doc = new ProductDoc(
                event.getProductId(),
                event.getSellerId(),
                event.getBrandId(),
                event.getBrandName(),
                event.getCategoryId(),
                event.getCategorySlug(),
                event.getCategoryName(),
                event.getName(),
                event.getSlug(),
                event.getDescription(),
                event.getPrice(),
                event.getImageUrls() != null ? event.getImageUrls() : List.of(),
                event.getMetadata(),
                event.getCreatedAt(),
                Instant.now()
        );
        IndexRequest<ProductDoc> request = IndexRequest.of(r -> r
                .index(indexName)
                .id(doc.productId())
                .document(doc)
        );
        client.index(request);
        log.debug("search-service: indexed product {}", doc.productId());
    }
}
