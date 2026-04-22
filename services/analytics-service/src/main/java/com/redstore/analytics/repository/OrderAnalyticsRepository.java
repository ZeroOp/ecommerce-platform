package com.redstore.analytics.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.analytics.dto.AnalyticsSummaryDto;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class OrderAnalyticsRepository {

    private final ClickHouseClient clickHouseClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String database;

    public OrderAnalyticsRepository(
            ClickHouseClient clickHouseClient,
            @Value("${analytics.clickhouse.database}") String database
    ) {
        this.clickHouseClient = clickHouseClient;
        this.database = database;
    }

    @PostConstruct
    public void initSchema() {
        int attempts = 12;
        for (int i = 1; i <= attempts; i++) {
            try {
                clickHouseClient.executeWithoutDatabase("CREATE DATABASE IF NOT EXISTS " + database);
                clickHouseClient.execute("""
                        CREATE TABLE IF NOT EXISTS order_event_log (
                            order_id String,
                            user_id String,
                            seller_ids String,
                            status String,
                            event_type String,
                            amount Float64,
                            event_time DateTime,
                            event_date Date MATERIALIZED toDate(event_time)
                        ) ENGINE = MergeTree()
                        ORDER BY (event_date, order_id, event_time)
                        """);
                return;
            } catch (Exception e) {
                if (i == attempts) {
                    throw e;
                }
                try {
                    Thread.sleep(2000L);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("Interrupted while waiting for ClickHouse", ie);
                }
            }
        }
    }

    public void insertEvent(
            String orderId,
            String userId,
            Set<String> sellerIds,
            String status,
            String eventType,
            BigDecimal amount,
            Instant eventTime
    ) {
        String sellersCsv = sellerIds == null ? "" : sellerIds.stream()
                .filter(s -> s != null && !s.isBlank())
                .sorted()
                .collect(Collectors.joining(","));
        String sql = "INSERT INTO order_event_log (order_id,user_id,seller_ids,status,event_type,amount,event_time) VALUES (" +
                quote(orderId) + "," +
                quote(userId) + "," +
                quote(sellersCsv) + "," +
                quote(status) + "," +
                quote(eventType) + "," +
                (amount == null ? "0" : amount.toPlainString()) + "," +
                "toDateTime(" + (eventTime == null ? Instant.now().getEpochSecond() : eventTime.getEpochSecond()) + ")" +
                ")";
        clickHouseClient.execute(sql);
    }

    public AnalyticsSummaryDto summaryForAdmin() {
        return buildSummary("1=1");
    }

    public AnalyticsSummaryDto summaryForSeller(String sellerId) {
        String safeSeller = quote(sellerId == null ? "" : sellerId);
        String predicate = "position(concat(',', seller_ids, ','), concat(',', " + safeSeller + ", ',')) > 0";
        return buildSummary(predicate);
    }

    private AnalyticsSummaryDto buildSummary(String basePredicate) {
        String sql = """
                SELECT
                  count() AS totalOrders,
                  sum(if(status = 'CREATED', 1, 0)) AS pendingCount,
                  sum(if(status = 'IN_PROGRESS', 1, 0)) AS inProgressCount,
                  sum(if(status = 'SHIPPED', 1, 0)) AS shippedCount,
                  sum(if(status = 'COMPLETED', 1, 0)) AS completedCount,
                  sum(if(status IN ('CANCELLED','EXPIRED'), 1, 0)) AS cancelledCount,
                  sum(if(status = 'COMPLETED', amount, 0)) AS grossRevenue
                FROM (
                    SELECT
                      order_id,
                      argMax(status, event_time) AS status,
                      max(amount) AS amount
                    FROM order_event_log
                    WHERE %s
                    GROUP BY order_id
                )
                FORMAT JSONEachRow
                """.formatted(basePredicate);

        String raw = clickHouseClient.query(sql).trim();
        if (raw.isEmpty()) {
            return AnalyticsSummaryDto.builder()
                    .totalOrders(0).pendingCount(0).inProgressCount(0).shippedCount(0)
                    .completedCount(0).cancelledCount(0).grossRevenue(0)
                    .build();
        }
        try {
            List<Map<String, Object>> rows = parseJsonEachRow(raw);
            Map<String, Object> row = rows.isEmpty() ? Map.of() : rows.get(0);
            return AnalyticsSummaryDto.builder()
                    .totalOrders(num(row.get("totalOrders")))
                    .pendingCount(num(row.get("pendingCount")))
                    .inProgressCount(num(row.get("inProgressCount")))
                    .shippedCount(num(row.get("shippedCount")))
                    .completedCount(num(row.get("completedCount")))
                    .cancelledCount(num(row.get("cancelledCount")))
                    .grossRevenue(dnum(row.get("grossRevenue")))
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse ClickHouse summary response", e);
        }
    }

    private static String quote(String value) {
        return "'" + (value == null ? "" : value.replace("'", "''")) + "'";
    }

    private static long num(Object value) {
        if (value == null) return 0;
        if (value instanceof Number n) return n.longValue();
        return Long.parseLong(value.toString());
    }

    private static double dnum(Object value) {
        if (value == null) return 0;
        if (value instanceof Number n) return n.doubleValue();
        return Double.parseDouble(value.toString());
    }

    private List<Map<String, Object>> parseJsonEachRow(String raw) throws Exception {
        List<Map<String, Object>> out = new ArrayList<>();
        for (String line : raw.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            out.add(objectMapper.readValue(trimmed, new TypeReference<>() {}));
        }
        return out;
    }
}
