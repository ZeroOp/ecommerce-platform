package com.redstore.identity.controller;

import com.redstore.identity.dto.AdminSellerRowDto;
import com.redstore.identity.dto.UpdateSellerActiveRequest;
import com.redstore.identity.service.AdminSellerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sellers")
public class AdminSellerController {

    private final AdminSellerService adminSellerService;

    public AdminSellerController(AdminSellerService adminSellerService) {
        this.adminSellerService = adminSellerService;
    }

    @GetMapping
    public List<AdminSellerRowDto> listSellers() {
        return adminSellerService.listSellers();
    }

    @PatchMapping("/active")
    public AdminSellerRowDto setSellerActive(@Valid @RequestBody UpdateSellerActiveRequest request) {
        return adminSellerService.setSellerActive(request.email(), request.active());
    }
}
