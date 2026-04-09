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
    private static final String SECRET = System.getenv("JWT_KEY");

    // Corrected to 15 minutes (15 * 60 * 1000)
    private static final long EXPIRATION_TIME = 900000;

    public static Key getSigningKey() {
        if (SECRET == null || SECRET.length() < 32) {
            throw new RuntimeException("JWT_KEY environment variable is missing or too short!");
        }
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public static String generateToken(UserPayload payload) {
        return Jwts.builder()
                .setSubject(payload.getId()) // 0.11.x uses setSubject
                .claim("email", payload.getEmail())
                .claim("roles", payload.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toList()))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public static UserPayload validateAndGetPayload(String token) {
        // 0.11.x uses parserBuilder() and setSigningKey()
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