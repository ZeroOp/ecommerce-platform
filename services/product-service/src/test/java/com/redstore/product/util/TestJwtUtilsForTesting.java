package com.redstore.product.util;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Test-specific JWT utility that uses a hardcoded key for testing
 */
public class TestJwtUtilsForTesting {
    
    private static final String JWT_SECRET = "test-secret-key-for-jwt-token-generation-that-is-long-enough-to-meet-all-requirements-and-security-standards";
    
    private static final long EXPIRATION_TIME = 900000;
    
    public SecretKey getSigningKey() {
        if (JWT_SECRET == null || JWT_SECRET.length() < 32) {
            throw new RuntimeException("JWT_KEY is missing or too short!");
        }
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }
    
    public static String generateToken(UserPayload payload) {
        TestJwtUtilsForTesting jwtUtils = new TestJwtUtilsForTesting();
        return Jwts.builder()
                .subject(payload.getId())
                .claim("email", payload.getEmail())
                .claim("roles", payload.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toList()))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(jwtUtils.getSigningKey())
                .compact();
    }
    
    public static UserPayload validateAndGetPayload(String token) {
        TestJwtUtilsForTesting jwtUtils = new TestJwtUtilsForTesting();
        Claims claims = Jwts.parser()
                .verifyWith(jwtUtils.getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return UserPayload.builder()
                .id(claims.getSubject())
                .email(claims.get("email", String.class))
                .roles(extractRoles(claims))
                .build();
    }
    
    @SuppressWarnings("unchecked")
    private static Set<UserRole> extractRoles(Claims claims) {
        List<String> rolesList = claims.get("roles", List.class);
        if (rolesList == null || rolesList.isEmpty()) {
            return Set.of();
        }
        return rolesList.stream()
                .map(role -> UserRole.valueOf(role.toUpperCase()))
                .collect(Collectors.toSet());
    }
}
