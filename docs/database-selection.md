# Database Selection and Rationale

This document explains the database strategy used by RedStore and the reasoning behind each service-level choice.

![Data platform placeholder](./images/placeholder-data-platform.png)
_Placeholder: Add diagram mapping services to data stores and read/write paths._

---

## 1) Selection Principles

Database decisions are based on workload shape and data guarantees, not one-size-fits-all standardization.

- **Transactional integrity first:** money/order/stock workflows require strict consistency.
- **Operational simplicity:** favor fewer store types unless there is clear value.
- **Read/write isolation:** analytical queries should not degrade transactional APIs.
- **Scalability by responsibility:** each service owns its persistence independently.
- **Evolvability:** schema and migration strategy should support continuous delivery.

---

## 2) Data Stores in the Platform

### 2.1 PostgreSQL (Primary OLTP Store)
Used for strongly consistent transactional domains:
- identity/auth data
- orders
- payments
- inventory state and reservations
- catalog data where relational constraints are important

**Why PostgreSQL**
- ACID transactions.
- Mature indexing and query planner.
- Strong ecosystem with Spring Data/JPA.
- Reliable migrations and operational tooling.

### 2.2 Redis (Cache / Ephemeral State)
Used for low-latency hot reads and short-lived key-based data.

**Why Redis**
- Very fast in-memory access.
- TTL support for self-healing stale cache entries.
- Ideal for request amplification hotspots (e.g., stock quantity reads).

### 2.3 ClickHouse (Analytics Read Store)
Used by analytics service for aggregated, high-volume event/reporting queries.

**Why ClickHouse**
- Columnar storage optimized for analytical scans/aggregations.
- High throughput for dashboard/report use cases.
- Keeps expensive analytical queries off OLTP databases.

### 2.4 MinIO (Object Storage)
Used for:
- product media objects
- archived event files
- database dump/snapshot artifacts

**Why MinIO**
- S3-compatible APIs.
- Durable object semantics.
- Cost-effective storage for large binary and archival data.

---

## 3) Service-by-Service Decision Matrix

## 3.1 Identity Service -> PostgreSQL
- User credentials, roles, seller lifecycle states.
- Requires correctness, uniqueness, and secure updates.
- Strong transactional semantics are mandatory.

## 3.2 Product Service -> PostgreSQL
- Products, categories, brands, and ownership relations.
- Relational integrity and join-heavy admin/seller queries.
- Flexible attributes can still be stored via JSON columns if needed.

## 3.3 Inventory Service -> PostgreSQL + Redis
- PostgreSQL for source-of-truth stock and reservations.
- Redis for fast quantity reads and short-lived cache snapshots.
- This split balances correctness (DB) and speed (cache).

## 3.4 Order Service -> PostgreSQL
- Order lifecycle state machine and immutable snapshots.
- Requires idempotency, consistency, and auditability.

## 3.5 Payment Service -> PostgreSQL
- Payment records and status transitions.
- Financially sensitive domain requiring strict consistency and traceability.

## 3.6 Analytics Service -> ClickHouse
- Event-derived summaries and trend analytics.
- Read-heavy aggregation workload fits columnar analytics model.

## 3.7 Archive/Snapshot Flows -> MinIO
- Durable historical records and backup artifacts.
- Object storage is better suited than relational tables for raw archive payloads.

---

## 4) Why Not Use a Single Database Everywhere?

- Different workloads have conflicting optimization goals.
- Analytics queries can lock or slow transactional workloads.
- Caching needs differ from source-of-truth persistence.
- Service autonomy is harder if all teams share a single monolithic schema.

---

## 5) Data Consistency Strategy

### 5.1 Within a Service
- Use transactional boundaries in PostgreSQL.
- Enforce constraints and unique keys to prevent invalid state.

### 5.2 Across Services
- Use event-driven eventual consistency.
- Model workflows with explicit states and compensating actions.
- Ensure consumers are idempotent (at-least-once delivery safe).

---

## 6) Performance Strategy

- Add service-local indexes for dominant query paths.
- Keep object payloads out of OLTP rows (store keys/URLs instead).
- Cache frequently read counters or denormalized views in Redis.
- Pre-aggregate analytical metrics in ClickHouse for dashboards.

![Indexing and cache flow placeholder](./images/placeholder-index-cache-flow.png)
_Placeholder: Add diagram showing API read path -> Redis -> PostgreSQL fallback._

---

## 7) Operational Considerations

- Backup OLTP stores and verify restore procedures regularly.
- Monitor replication lag, connection pool pressure, and slow queries.
- Track cache hit ratio and stale-cache impact.
- Monitor ClickHouse ingestion lag and query latency percentiles.

---

## 8) Security and Compliance Considerations

- Encrypt credentials/secrets at rest and in transit.
- Restrict direct DB access to service accounts.
- Avoid storing raw sensitive payloads in analytics/archives unless required.
- Maintain retention policies for audit and archival data.

---

## 9) Summary Table

| Domain / Service | Primary Store | Secondary Store | Primary Reason |
| --- | --- | --- | --- |
| Identity | PostgreSQL | Redis (optional token/session support) | Strong consistency for auth/roles |
| Product Catalog | PostgreSQL | MinIO for media objects | Relational integrity + media offload |
| Inventory | PostgreSQL | Redis | Correctness + low-latency stock reads |
| Orders | PostgreSQL | None (core) | Transactional workflow state |
| Payments | PostgreSQL | None (core) | Financial integrity and auditability |
| Analytics | ClickHouse | Ingest from event bus | Fast aggregation and reporting |
| Archive / Backup | MinIO | Source DB/Event streams | Durable long-term storage |

---

## 10) Review and Evolution Guidelines

- Revisit store choices when workload shape changes.
- Introduce a new store only with clear SLO or cost benefit.
- Document migrations and rollback plans before major schema changes.
