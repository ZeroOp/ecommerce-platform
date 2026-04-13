package com.redstore.identity.service;

import com.redstore.common.enums.UserRole;
import com.redstore.common.dto.SellerRegisteredEventData;
import com.redstore.identity.model.User;
import com.redstore.identity.model.UserId;
import com.redstore.identity.repository.UserRepository;
import com.redstore.identity.events.publishers.SellerRegisteredPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor // Automatically injects the repository
public class AuthService {

    private final UserRepository userRepository;
    private final SellerRegisteredPublisher sellerRegisteredPublisher;

    @Transactional
    public User registerOrFindUser(String email, UserRole role) {
        // Logic: If user exists with this email+role combination, return them. If not, create a new one.
        return userRepository.findById_EmailAndId_Role(email, role)
                .orElseGet(() -> {
                    UserId userId = new UserId(email, role);
                    User newUser = User.builder()
                            .id(userId)
                            .password("GOOGLE_AUTH_USER") // Placeholder for OAuth
                            .isActive(true)
                            .build();
                    
                    User savedUser = userRepository.save(newUser);
                    
                    // Publish seller registration event if this is a new seller
                    if (role == UserRole.SELLER) {
                        publishSellerRegisteredEvent(savedUser, true);
                    }
                    
                    return savedUser;
                });
    }

    // Keep original method for backward compatibility
    @Transactional
    public User registerOrFindUser(String email) {
        return registerOrFindUser(email, UserRole.BUYER);
    }

    private void publishSellerRegisteredEvent(User user, boolean isFirstTimeRegistration) {
        try {
            SellerRegisteredEventData eventData = SellerRegisteredEventData.builder()
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .registrationTime(LocalDateTime.now())
                    .registrationSource("google")
                    .isFirstTimeRegistration(isFirstTimeRegistration)
                    .build();

            log.info("Publishing seller registration event for: {}", user.getEmail());
            sellerRegisteredPublisher.publish(eventData);
            log.info("Successfully published seller registration event for: {}", user.getEmail());

        } catch (Exception e) {
            // We catch this so a messaging failure doesn't block the user from registering
            log.error("Failed to publish seller registration event for user: {}", user.getEmail(), e);
        }
    }
}