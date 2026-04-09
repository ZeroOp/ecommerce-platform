package com.redstore.identity.service;

import com.redstore.common.dto.UserLoginEventData; // Added import
import com.redstore.common.dto.UserPayload;
import com.redstore.common.utils.JwtUtils;
import com.redstore.identity.events.publishers.UserLoginPublisher;
import com.redstore.identity.model.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Added for logging
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j // Added logging annotation
@RequiredArgsConstructor
public class SessionService {

    private final StringRedisTemplate redisTemplate;
    private final UserLoginPublisher userLoginPublisher;

    // 15 Minutes for the Access Token
    private static final int ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
    // 30 Days for the Refresh Token in Redis
    private static final Duration REFRESH_TOKEN_EXPIRY = Duration.ofDays(30);

    public void createSession(User user, HttpServletResponse response) {

        // 1. Build the payload
        UserPayload userPayload = UserPayload.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .roles(Set.of(user.getRole()))
                .build();

        // 2. Generate the short-lived 15-minute JWT
        String jwtToken = JwtUtils.generateToken(userPayload);

        // 3. Generate a long-lived random Refresh Token
        String refreshToken = UUID.randomUUID().toString();

        // 4. Save the Refresh Token in Redis mapped to the User's ID
        String redisKey = "refresh_token:" + refreshToken;
        redisTemplate.opsForValue().set(redisKey, user.getId().toString(), REFRESH_TOKEN_EXPIRY);

        // 5. Drop both as secure cookies to the user's browser
        response.addCookie(createCookie("session", jwtToken, ACCESS_TOKEN_EXPIRY_SECONDS));
        response.addCookie(createCookie("refresh_token", refreshToken, (int) REFRESH_TOKEN_EXPIRY.toSeconds()));

        // 🟢 6. Publish User Login Event to NATS
        try {
            UserLoginEventData eventData = UserLoginEventData.builder()
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .loginTime(LocalDateTime.now().toString())
                    .build();

            log.info("Attempting to publish login event for user: {}", user.getEmail());
            userLoginPublisher.publish(eventData);
            log.info("Successfully published login event for user: {}", user.getEmail());

        } catch (Exception e) {
            // We catch this so a messaging failure doesn't block the user from logging in
            log.error("Failed to publish login event for user: {}", user.getEmail(), e);
        }
    }

    private Cookie createCookie(String name, String value, int maxAgeInSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        // Important: If you're testing locally on http://localhost without a proxy like ingress-nginx
        // handling SSL, you might need to setSecure(false) temporarily.
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeInSeconds);
        return cookie;
    }
}