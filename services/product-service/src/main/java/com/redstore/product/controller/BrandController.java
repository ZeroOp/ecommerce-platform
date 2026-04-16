package com.redstore.product.controller;

import org.springframework.web.bind.annotation.GetMapping;
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
}
