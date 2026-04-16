package com.redstore.product.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/product")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}
