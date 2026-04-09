package com.redstore.common.utils;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.Test;
import java.util.Date;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    @Test
    void shouldGenerateValidSigningKey() {
        assertNotNull(JwtUtils.getSigningKey());
    }

    @Test
    void shouldParseValidTokenSuccessfully() {
        String token = Jwts.builder()
                .subject("user-123")
                .claim("email", "jaya@redstore.com")
                // FIX: Use UserRole.ADMIN.name() instead of raw String "ADMIN"
                .claim("roles", Set.of(UserRole.ADMIN.name()))
                .issuedAt(new Date())
                .signWith(JwtUtils.getSigningKey())
                .compact();

        UserPayload payload = JwtUtils.validateAndGetPayload(token);

        assertEquals("user-123", payload.getId());
        assertEquals("jaya@redstore.com", payload.getEmail());
        // FIX: Check for the Enum constant, not the String
        assertTrue(payload.getRoles().contains(UserRole.ADMIN));
    }
}