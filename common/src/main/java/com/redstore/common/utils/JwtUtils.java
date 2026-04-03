package com.redstore.common.utils;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class JwtUtils {
    // Pull from K8s Environment Variable (Matching your Node 'JWT_KEY')
    private static final String SECRET = System.getenv("JWT_KEY");

    // 24 Hours in milliseconds
    private static final long EXPIRATION_TIME = 86400000;

    public static Key getSigningKey() {
        if (SECRET == null || SECRET.length() < 32) {
            // If K8s fails to inject it, we should crash early rather than run insecurely
            throw new RuntimeException("JWT_KEY environment variable is missing or too short! Must be at least 32 characters.");
        }
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    /**
     * Generates a JWT token for a given UserPayload
     */
    public static String generateToken(UserPayload payload) {
        return Jwts.builder()
                .setSubject(payload.getId())
                .claim("email", payload.getEmail())
                // Convert Enums to Strings for JSON compatibility in the JWT
                .claim("roles", payload.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toList()))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a token and returns the UserPayload
     */
    public static UserPayload validateAndGetPayload(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return UserPayload.builder()
                .id(claims.getSubject())
                .email(claims.get("email", String.class))
                .roles(extractRoles(claims))
                .build();
    }

    /**
     * Safely maps the raw 'roles' list from JWT claims to our UserRole Enum Set
     */
    @SuppressWarnings("unchecked")
    private static Set<UserRole> extractRoles(Claims claims) {
        List<String> rolesList = claims.get("roles", List.class);

        if (rolesList == null || rolesList.isEmpty()) {
            return Set.of();
        }

        return rolesList.stream()
                .map(role -> {
                    try {
                        // Normalize to Uppercase to match Enum naming convention
                        return UserRole.valueOf(role.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        // Log or handle unknown roles if necessary
                        throw new RuntimeException("Unknown role detected in JWT: " + role);
                    }
                })
                .collect(Collectors.toSet());
    }
}