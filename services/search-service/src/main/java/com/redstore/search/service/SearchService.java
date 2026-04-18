package com.redstore.search.service;

import com.redstore.search.dto.ProductDoc;
import com.redstore.search.dto.ProductSearchHit;
import com.redstore.search.dto.SearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.SortOrder;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.opensearch.client.opensearch.core.GetResponse;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.search.Hit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Read-side of the search-service — thin wrapper around the OpenSearch client
 * that translates public query parameters into index requests. Image URLs
 * embedded in documents are already public and static, so hits are returned
 * verbatim without any presigning step.
 */
@Slf4j
@Service
public class SearchService {

    private final OpenSearchClient client;

    @Value("${search.products.index}")
    private String indexName;

    public SearchService(OpenSearchClient client) {
        this.client = client;
    }

    public SearchResponse searchProducts(String query, String categoryId, String brandId, Integer limit) {
        return searchProducts(query, categoryId, null, brandId, limit);
    }

    public SearchResponse searchProducts(String query, String categoryId, List<String> categoryIds, String brandId, Integer limit) {
        int size = clamp(limit);
        String q = query == null ? "" : query.trim();

        try {
            SearchRequest request = SearchRequest.of(s -> {
                s.index(indexName).size(size);
                s.query(buildQuery(q, categoryId, categoryIds, brandId));
                if (q.isEmpty()) {
                    s.sort(sort -> sort.field(f -> f.field("createdAt").order(SortOrder.Desc)));
                }
                return s;
            });

            org.opensearch.client.opensearch.core.SearchResponse<ProductDoc> resp =
                    client.search(request, ProductDoc.class);

            long total = resp.hits().total() != null ? resp.hits().total().value() : 0L;
            int took = (int) resp.took();
            List<ProductSearchHit> out = new ArrayList<>();
            for (Hit<ProductDoc> hit : resp.hits().hits()) {
                ProductDoc d = hit.source();
                if (d == null) {
                    continue;
                }
                out.add(toHit(d, hit.score()));
            }
            return new SearchResponse(q, total, took, out);
        } catch (IOException e) {
            log.error("search-service: query '{}' failed: {}", q, e.getMessage());
            return new SearchResponse(q, 0L, 0, List.of());
        }
    }

    public ProductSearchHit getById(String productId) {
        try {
            GetResponse<ProductDoc> resp = client.get(g -> g.index(indexName).id(productId), ProductDoc.class);
            if (!resp.found() || resp.source() == null) {
                return null;
            }
            return toHit(resp.source(), null);
        } catch (IOException e) {
            log.error("search-service: get '{}' failed: {}", productId, e.getMessage());
            return null;
        }
    }

    private ProductSearchHit toHit(ProductDoc d, Double score) {
        List<String> urls = d.imageUrls() != null ? d.imageUrls() : List.of();
        return new ProductSearchHit(
                d.productId(),
                d.sellerId(),
                d.brandId(),
                d.brandName(),
                d.categoryId(),
                d.categorySlug(),
                d.categoryName(),
                d.name(),
                d.slug(),
                d.description(),
                d.price(),
                urls,
                d.metadata(),
                d.createdAt(),
                score
        );
    }

    private Query buildQuery(String q, String categoryId, List<String> categoryIds, String brandId) {
        List<Query> musts = new ArrayList<>();
        if (!q.isEmpty()) {
            // multi_match gives us fuzzy + prefix on the product name plus
            // a term match on the slug, which is the common "brand-name" lookup.
            musts.add(Query.of(m -> m.multiMatch(mm -> mm
                    .query(q)
                    .fuzziness("AUTO")
                    .fields(List.of("name^3", "brandName^2", "slug", "description", "metadata.*"))
            )));
        }
        // Either a single categoryId (legacy) OR a set of categoryIds for a
        // category + descendants listing page — never both.
        List<String> effectiveCategoryIds = new ArrayList<>();
        if (categoryIds != null) {
            for (String id : categoryIds) {
                if (id != null && !id.isBlank()) {
                    effectiveCategoryIds.add(id.trim());
                }
            }
        }
        if (effectiveCategoryIds.isEmpty() && categoryId != null && !categoryId.isBlank()) {
            effectiveCategoryIds.add(categoryId.trim());
        }
        if (!effectiveCategoryIds.isEmpty()) {
            List<org.opensearch.client.opensearch._types.FieldValue> fvs = effectiveCategoryIds.stream()
                    .map(v -> org.opensearch.client.opensearch._types.FieldValue.of(fv -> fv.stringValue(v)))
                    .toList();
            musts.add(Query.of(m -> m.terms(t -> t
                    .field("categoryId")
                    .terms(tv -> tv.value(fvs))
            )));
        }
        if (brandId != null && !brandId.isBlank()) {
            musts.add(Query.of(m -> m.term(t -> t.field("brandId").value(v -> v.stringValue(brandId)))));
        }
        if (musts.isEmpty()) {
            return Query.of(m -> m.matchAll(ma -> ma));
        }
        return Query.of(m -> m.bool(b -> b.must(musts)));
    }

    private static int clamp(Integer n) {
        if (n == null) return 24;
        return Math.max(1, Math.min(100, n));
    }
}
