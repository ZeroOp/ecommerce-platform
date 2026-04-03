package com.redstore.identity.service;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.utils.JwtUtils;
import com.redstore.identity.model.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final StringRedisTemplate redisTemplate;

    // 15 Minutes for the Access Token
    private static final int ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
    // 30 Days for the Refresh Token in Redis
    private static final Duration REFRESH_TOKEN_EXPIRY = Duration.ofDays(30);

    public void  createSession(User user, HttpServletResponse response) {

        // 1. Build the payload
        UserPayload userPayload = UserPayload.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .roles(Set.of(user.getRole()))
                .build();

        // 2. Generate the short-lived 15-minute JWT
        // (Note: Make sure your JwtUtils.generateToken accepts an expiration time, or defaults to 15 mins!)
        String jwtToken = JwtUtils.generateToken(userPayload);

        // 3. Generate a long-lived random Refresh Token
        String refreshToken = UUID.randomUUID().toString();

        // 4. Save the Refresh Token in Redis mapped to the User's ID
        // Key format: "refresh_token:uuid_string" -> "user_id_string"
        String redisKey = "refresh_token:" + refreshToken;
        redisTemplate.opsForValue().set(redisKey, user.getId().toString(), REFRESH_TOKEN_EXPIRY);

        // 5. Drop both as secure cookies to the user's browser
        response.addCookie(createCookie("session", jwtToken, ACCESS_TOKEN_EXPIRY_SECONDS));
        response.addCookie(createCookie("refresh_token", refreshToken, (int) REFRESH_TOKEN_EXPIRY.toSeconds()));
    }

    private Cookie createCookie(String name, String value, int maxAgeInSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Set to false if testing locally without HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeInSeconds);
        return cookie;
    }
}