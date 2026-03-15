
# Functional Requirements

The ecommerce platform supports three primary actors:

* Customers (Users)
* Sellers
* Administrators

---

# 1. Customer (User) Features

### Authentication

* Users should be able to **sign up** and **sign in** to the platform.
* Authentication will be handled through the authentication service.

### Product Browsing

Users should be able to browse products available in the platform.

Products can be filtered by:

* Brand
* Category
* Subcategory

The backend services must support these filters efficiently.

### Product Details

Users should be able to open a **product details page** where they can view:

* Product title
* Description
* Price
* Brand
* Category
* Available stock
* Ratings
* Customer comments

### Cart Management

Users should be able to:

* Add products to cart
* Remove products from cart
* Update product quantity in the cart

### Order Placement

If the product is available in stock, users should be able to:

* Proceed to checkout
* Purchase the items in their cart

### Payments

Users should be able to:

* Complete payment for an order
* Payment will be processed by the **Payment Service**

### Order Tracking

Users should be able to track the order status such as:

* Order Started
* In Progress
* Shipped
* Completed
* Failed

### Order History

Users should be able to view their **previous orders** which include:

* Items purchased
* Quantity of each item
* Price per unit
* Total order price
* Order date

Users should also be able to download the **invoice as a PDF**.

### Product Reviews

Users should be able to:

* Rate purchased products
* Leave comments and reviews on products

### Review Visibility

On the product details page, users should also be able to:

* View ratings
* View comments from other customers

---

# 2. Seller Features

Sellers will have a dedicated route within the same application.

Example:

* `/seller`

### Seller Registration

Sellers should be able to **sign up** on the platform.

However, seller accounts require **admin verification** before gaining full access.

### Brand Creation

Each seller must create a **brand** during registration.

A brand can contain multiple product categories.

### Seller Verification

Before sellers can add products to the platform:

* The seller account must be **verified by the admin**

Until verification is completed, sellers cannot list products.

### Product Management

Once verified, sellers should be able to:

* Add products
* Provide product title
* Provide product description
* Set product price
* Assign product category
* Assign subcategory

### Inventory Management

Sellers should also be able to:

* Manage product stock
* Update the quantity of products available for sale

---

# 3. Admin Features

Admins will have a **separate administration panel**.

Example:

* `/admin`

### Seller Verification

Admins should be able to:

* Approve seller registrations
* Reject seller registrations

### Order Monitoring

Whenever a user places an order, the order will begin with the status:

* `Order Started`

Admins should be able to update the order status through the following stages:

* Order Started
* In Progress
* Shipped
* Completed
* Failed

### Failed Orders

If an order fails during processing, the **Payment Service** will automatically initiate a refund.
