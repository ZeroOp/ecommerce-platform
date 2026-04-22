# System Architecture

This document describes the RedStore system architecture at runtime, including service boundaries, communication patterns, data ownership, and operational concerns.

![System context placeholder](./images/placeholder-system-context.png)
_Placeholder: Add a C4 level-1 system context diagram._

---

## 1) Architectural Style

RedStore follows a **microservices architecture** with these principles:

- **Service autonomy:** each service owns its business logic and persistence.
- **Independent deployability:** services can be released without redeploying the entire platform.
- **Mixed communication model:** synchronous REST for request-response workflows and asynchronous NATS events for cross-service coordination.
- **Shared platform primitives:** common authentication and event utilities in a reusable `common` module.

---

## 2) High-Level Components

### 2.1 Frontend
- `redstore-client` (Angular SPA) provides:
  - Public storefront.
  - Seller dashboard.
  - Admin panel.

### 2.2 Core Domain Services (Java/Spring)
- `identity-service` for auth and role lifecycle.
- `product-service` for catalog/brand/category.
- `inventory-service` for stock and reservation.
- `order-service` for order creation/tracking.
- `payment-service` for payment records and completion events.
- `analytics-service` for read-side reporting and business metrics.
- `archive-service` for durable event archival.

### 2.3 Shared Module
- `common` module provides:
  - JWT parsing/context utilities.
  - Role-based annotations/aspects.
  - Shared event DTOs and publishers.
  - Cross-service exception primitives.

### 2.4 Infrastructure Layer
- Kubernetes deployments/services/ingress.
- NATS JetStream event bus.
- Postgres (multiple service-owned schemas/clusters).
- Redis cache (hot read paths like inventory).
- ClickHouse (analytics query workloads).
- MinIO object storage (media, archives, snapshots).

![Container-level placeholder](./images/placeholder-container-view.png)
_Placeholder: Add a C4 level-2 container diagram._

---

## 3) Communication Patterns

### 3.1 Synchronous REST
Use when immediate response is required:
- Client -> service APIs.
- Service-to-service calls for validation and ownership checks.

**Examples**
- Inventory verifying seller product ownership.
- Frontend fetching product details and stock quantity.

### 3.2 Asynchronous Events (NATS JetStream)
Use for decoupled workflow propagation:
- Order created/updated.
- Payment completed/failed.
- Inventory reserved/released.
- Domain events consumed by archive and analytics pipelines.

**Benefits**
- Temporal decoupling between producers and consumers.
- Better resilience during partial outages.
- Replay-friendly and auditable event streams.

---

## 4) Data Ownership and Storage Strategy

Each service owns its persistence and schema lifecycle.

- **PostgreSQL:** transactional domains (identity, orders, payments, inventory).
- **Redis:** low-latency ephemeral cache and frequently accessed counters.
- **ClickHouse:** analytical/aggregated reads for dashboards and trend queries.
- **MinIO:** object storage for images, event archives, and dump files.

See also: [`database-selection.md`](./database-selection.md).

---

## 5) Request and Event Flow (Example)

### 5.1 Happy path: checkout to completion
1. User checks out via frontend.
2. Order service creates order and emits order-created event.
3. Inventory reservation is attempted.
4. Payment service confirms payment.
5. Payment completion event updates order lifecycle.
6. Analytics and archive consume resulting events asynchronously.

### 5.2 Failure path: payment failure
1. Payment fails or expires.
2. Failure event emitted.
3. Order transitions to failed/expired state.
4. Reserved inventory is released.
5. User receives failure status in order details/history.

![Sequence flow placeholder](./images/placeholder-checkout-sequence.png)
_Placeholder: Add sequence diagram for checkout success/failure._

---

## 6) Security Architecture

- JWT-based identity propagation across HTTP boundaries.
- Role enforcement through shared annotations/aspects (`USER`, `SELLER`, `ADMIN`).
- Internal machine APIs protected by service-level secret headers where needed.
- Secrets injected via Kubernetes Secrets, not hardcoded in source.
- CORS and web config constrained per environment profile.

---

## 7) Scalability and Reliability

### 7.1 Scalability
- Stateless services can scale horizontally behind Kubernetes services.
- Read-heavy paths can leverage caching and read-optimized stores.
- Analytics separated from OLTP databases to protect transactional latency.

### 7.2 Reliability
- Event durability via JetStream.
- Retry-friendly consumers.
- Archive service provides immutable audit trail.
- Snapshot strategy supports backup and recovery workflows.

---

## 8) Observability and Operations

Recommended observability baseline:
- Structured logs with request/event correlation IDs.
- Service health and readiness probes.
- Metrics for latency, error rates, queue lag, and consumer throughput.
- Dashboards for orders, payment success rate, and inventory drift checks.

![Observability dashboard placeholder](./images/placeholder-observability-dashboard.png)
_Placeholder: Add screenshot or wireframe of platform monitoring dashboard._

---

## 9) Deployment Topology (Kubernetes)

- Ingress routes traffic by path prefix to service backends.
- Each service has Deployment + Service resources.
- Stateful dependencies run with dedicated manifests/operators.
- `skaffold dev` provides local iterative dev loop for containerized services.

---

## 10) Architectural Risks and Mitigations

- **Cross-service contract drift** -> use shared DTO/event versioning and contract tests.
- **At-least-once event delivery side effects** -> design consumers to be idempotent.
- **Distributed transaction complexity** -> use saga-style compensation and explicit status transitions.
- **Read/write model coupling** -> keep analytics and transactional stores separate.

---

## 11) Future Evolution

- Add standardized distributed tracing across all services.
- Introduce schema/event compatibility policy and governance.
- Improve autoscaling rules by workload profile.
- Add DLQ/replay tooling for failed event processing.