package com.redstore.identity.service;

import com.redstore.common.enums.UserRole;
import com.redstore.common.exceptions.BadRequestException;
import com.redstore.common.exceptions.ForbiddenException;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.utils.UserContext;
import com.redstore.identity.dto.AdminSellerRowDto;
import com.redstore.identity.model.User;
import com.redstore.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminSellerService {

    private final UserRepository userRepository;

    public AdminSellerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminSellerRowDto> listSellers() {
        requireAdmin();
        return userRepository.findAllByRole(UserRole.SELLER).stream()
                .map(u -> AdminSellerRowDto.builder()
                        .email(u.getEmail())
                        .active(u.isActive())
                        .userId(u.getId().toString())
                        .build())
                .toList();
    }

    @Transactional
    public AdminSellerRowDto setSellerActive(String email, boolean active) {
        requireAdmin();
        User seller = userRepository.findById_EmailAndId_Role(email.trim(), UserRole.SELLER)
                .orElseThrow(() -> new BadRequestException("Seller not found for email"));
        seller.setActive(active);
        userRepository.save(seller);
        return AdminSellerRowDto.builder()
                .email(seller.getEmail())
                .active(seller.isActive())
                .userId(seller.getId().toString())
                .build();
    }

    private void requireAdmin() {
        UserPayload u = UserContext.getUser();
        if (u == null || u.getRoles() == null || u.getRoles().stream().noneMatch(r -> r == UserRole.ADMIN)) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
