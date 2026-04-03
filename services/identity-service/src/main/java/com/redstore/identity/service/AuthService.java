package com.redstore.identity.service;

import com.redstore.common.enums.UserRole;
import com.redstore.identity.model.User;
import com.redstore.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor // Automatically injects the repository
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public User registerOrFindUser(String email) {
        // Logic: If user exists, return them. If not, create a new one.
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .password("GOOGLE_AUTH_USER") // Placeholder for OAuth
                            .role(UserRole.BUYER)
                            .isActive(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}