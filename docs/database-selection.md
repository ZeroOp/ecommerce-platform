# Database Selection per Microservice

This document explains why specific databases were chosen for each microservice based on access patterns, consistency needs, and scalability.

---

## Guiding Principles

* **Strong consistency & transactions → PostgreSQL**
* **Flexible schema & read-heavy → MongoDB**
* **Low latency & temporary data → Redis**

---

## Service-wise Database Decisions

### 1. Auth Service → PostgreSQL

* Requires **ACID transactions**
* Handles sensitive data (credentials, tokens)
* Needs strong consistency

---

### 2. User Service → PostgreSQL

* Structured relational data (profiles, addresses)
* Ensures data integrity

---

### 3. Product Service → MongoDB

* Flexible schema (different product types)
* Handles dynamic attributes (size, specs, etc.)
* Optimized for **read-heavy catalog queries**

---

### 4. Inventory Service → PostgreSQL

* Critical for **stock consistency**
* Prevents overselling using transactions/locking

---

### 5. Cart Service → Redis (+ optional DB backup)

* High-speed read/write operations
* Ephemeral data with TTL (cart expiry)
* Optional persistence for recovery

---

### 6. Order Service → PostgreSQL

* Requires **strong consistency**
* Stores final, immutable business data
* Supports transactional workflows

---

### 7. Payment Service → PostgreSQL

* Critical financial data
* Requires **auditability + strict consistency**

---

### 8. Seller Service → PostgreSQL

* Structured business data (products, listings)
* Relational queries required

---

### 9. Admin Service → PostgreSQL

* Operational data (reports, configs)
* Structured and consistent

---

### 10. Notification Service → Optional / Lightweight DB

* Mostly **event-driven**
* DB only needed for logs or retries

---

## Summary

| Service      | Database   | Reason                 |
| ------------ | ---------- | ---------------------- |
| Auth         | PostgreSQL | Transactions, security |
| User         | PostgreSQL | Structured data        |
| Product      | MongoDB    | Flexible schema        |
| Inventory    | PostgreSQL | Strong consistency     |
| Cart         | Redis      | Fast, temporary        |
| Order        | PostgreSQL | Critical transactions  |
| Payment      | PostgreSQL | Financial consistency  |
| Seller/Admin | PostgreSQL | Relational data        |
| Notification | Optional   | Event-driven           |

---

## Final Note

Database choice is driven by **use-case**, not uniformity.
Using the right database per service improves **scalability, performance, and reliability**.
