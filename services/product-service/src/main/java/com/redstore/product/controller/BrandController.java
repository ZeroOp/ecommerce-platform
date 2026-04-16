package com.redstore.product.controller;

import com.redstore.common.annotations.RequireSeller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Brand Controller for managing brand operations
 */
@RestController
@RequestMapping("/brands")
public class BrandController {
    
    /**
     * Get all brands - temporary implementation
     * @return Simple response
     */
    @GetMapping
    public List<String> getAllBrands() {
        return Collections.singletonList("brands endpoint working");
    }
    
    /**
     * Create a new brand - requires SELLER role
     * @param brandData Brand creation request data
     * @return Simple response for now
     */
    @PostMapping
    @RequireSeller
    public Map<String, Object> createBrand(@RequestBody Map<String, Object> brandData) {
        return Map.of(
            "message", "Brand created successfully",
            "status", "success",
            "data", brandData
        );
    }
}
