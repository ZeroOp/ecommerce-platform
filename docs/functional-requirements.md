
# Functional Requirements

This document defines the functional scope of the RedStore e-commerce platform and can be used as a source of truth for product, engineering, QA, and operations.

![User journey map placeholder](./images/placeholder-user-journey.png)
_Placeholder: Add a single end-to-end user journey image (browse -> cart -> order -> payment -> delivery)._

---

## 1) Actors and Permissions

### 1.1 Customer (USER)
- Browse products and categories.
- Manage cart and checkout.
- Pay for orders.
- Track order lifecycle and view order history.
- Submit reviews for eligible purchases.

### 1.2 Seller (SELLER)
- Create and manage brands/products after approval.
- Manage inventory.
- View and process seller orders.
- Monitor seller-focused analytics.

### 1.3 Administrator (ADMIN)
- Approve/reject seller requests.
- Manage platform categories/brands.
- Monitor orders and operational health.
- Access cross-platform analytics.

---

## 2) Customer Requirements

### 2.1 Authentication and Session
- User can sign up, sign in, sign out, and fetch current user profile.
- Platform supports role-aware authentication (USER/SELLER/ADMIN).
- Unauthorized protected routes return correct error responses.

**Acceptance criteria**
- Invalid credentials do not leak whether email exists.
- Protected APIs require valid auth context.
- Session state is reflected in UI immediately after login/logout.

### 2.2 Product Discovery
- User can browse products with pagination.
- User can filter by category, brand, and searchable metadata.
- User can open product detail view with images and stock visibility.

**Acceptance criteria**
- Product list returns only publishable products.
- Detail page includes current price and available quantity.

### 2.3 Cart Management
- User can add product to cart.
- User can update quantity or remove line items.
- Cart totals are recalculated after each update.

**Acceptance criteria**
- Quantity cannot go below 1.
- Cart cannot exceed available inventory for a line item.

### 2.4 Checkout and Order Creation
- User can checkout from cart.
- Order stores immutable snapshot of line-item pricing/details.
- Order creation reserves inventory before payment confirmation.

**Acceptance criteria**
- Checkout fails gracefully if any item is out of stock.
- Duplicate checkout submissions are idempotent at API level.

### 2.5 Payment
- User can confirm payment for pending orders.
- Payment status is stored and published as events.
- Payment failure triggers appropriate order failure/release behavior.

**Acceptance criteria**
- Successful payment marks order as completed flow state.
- Failed/expired payment does not consume stock permanently.

### 2.6 Order Tracking and History
- User can list own orders and view details.
- User can see lifecycle statuses:
  - `CREATED`
  - `IN_PROGRESS`
  - `SHIPPED`
  - `COMPLETED`
  - `FAILED`
  - `CANCELLED` (if supported by business flow)

**Acceptance criteria**
- User cannot access another user’s order details.
- Order timeline is consistent with emitted events.

### 2.7 Reviews and Ratings
- User can submit ratings/comments for completed purchases only.
- Ratings are visible on product detail page.

**Acceptance criteria**
- One review per user per order item rule (or explicit multi-review policy).
- Reviews for non-purchased products are blocked.

---

## 3) Seller Requirements

### 3.1 Seller Onboarding
- User can request seller access.
- Seller state transitions: `PENDING -> APPROVED | REJECTED`.

**Acceptance criteria**
- Pending sellers cannot use protected seller write endpoints.
- Approval updates role/permission behavior immediately.

### 3.2 Brand and Catalog Management
- Seller can create brand requests and product listings.
- Seller can provide title, description, category, metadata, price, and images.
- Product media upload uses pre-signed URL flow.

**Acceptance criteria**
- Only approved sellers can create products.
- Product metadata must match category template requirements.

### 3.3 Inventory Management
- Seller can add stock to owned products.
- Inventory quantity updates are durable and event-driven.

**Acceptance criteria**
- Seller cannot mutate inventory of non-owned products.
- Inventory updates are reflected in public quantity checks.

### 3.4 Seller Order Operations
- Seller can list seller-relevant orders.
- Seller can move order status through allowed transitions.

**Acceptance criteria**
- Illegal transitions are blocked (e.g., `SHIPPED -> CREATED`).
- Actions are auditable through event logs.

---

## 4) Admin Requirements

### 4.1 Seller Governance
- Admin can list seller requests and approve/reject them.
- Admin decisions are tracked and published as events.

### 4.2 Catalog Governance
- Admin can manage categories and brand approval status.
- Admin can inspect platform-wide product catalog.

### 4.3 Order Oversight
- Admin can monitor order statuses and exceptions.
- Admin can identify failed/expired orders for support workflows.

### 4.4 Platform Analytics
- Admin can access aggregate platform analytics and trends.
- Data can include order volume, completion rate, and revenue proxies.

---

## 5) Event-Driven Functional Behavior

The platform uses events to coordinate cross-service behavior.

**Expected functional outcomes**
- Order creation emits order-created event.
- Payment confirmation emits payment-completed event.
- Inventory reservation/release emits inventory events.
- Archive/analytics services consume events without blocking user flow.

![Event choreography placeholder](./images/placeholder-event-choreography.png)
_Placeholder: Add event choreography diagram (Order, Payment, Inventory, Analytics, Archive)._

---

## 6) Error and Edge Case Requirements

- Out-of-stock during checkout must return actionable error.
- Payment timeout must trigger order expiration or failure handling.
- Duplicate payment confirmation calls must not create duplicate records.
- Network retries from clients must not double-create orders.
- Unauthorized role access must return 401/403 consistently.

---

## 7) Non-Functional Requirements (Product-Level)

- **Performance:** common read paths should be low-latency under expected traffic.
- **Reliability:** key business flows remain durable across service restarts.
- **Security:** role-based access, safe secret handling, and audited actions.
- **Scalability:** independent service scaling for hotspots (catalog/order/payment).
- **Observability:** logs, events, and analytics available for debugging and operations.

---

## 8) Out of Scope (Current Phase)

- Multi-currency and taxation engine.
- Advanced recommendation/personalization.
- Complex returns and dispute workflows.
- Marketplace payout settlement automation.

---

## 9) Suggested Test Coverage

- Contract tests for key API endpoints by role.
- Integration tests for order -> inventory -> payment event chain.
- Idempotency tests for order creation and payment confirmation.
- Access-control tests for USER/SELLER/ADMIN route boundaries.
