package com.redstore.cart.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCatalogRepository extends JpaRepository<ProductCatalogEntry, String> {
}
