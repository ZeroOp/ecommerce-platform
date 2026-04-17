package com.redstore.product.repository;

import com.redstore.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, String> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsBySlug(String slug);
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentCategoryIdIsNullOrderByNameAsc();
    List<Category> findByParentCategoryIdOrderByNameAsc(String parentCategoryId);
}
