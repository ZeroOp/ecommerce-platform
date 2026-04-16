package com.redstore.product.util;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import jakarta.servlet.http.Cookie;

import java.util.Set;

/**
 * Test utility for creating real JWT tokens and cookies for different user roles
 */
public class TestJwtUtils {
    
    /**
     * Create a real JWT cookie for a user with specific role
     */
    public static Cookie createAuthCookie(UserRole role) {
        UserPayload user = UserPayload.builder()
                .id("test-user-" + role.name().toLowerCase())
                .email("test-" + role.name().toLowerCase() + "@example.com")
                .roles(Set.of(role))
                .build();
        
        String token = TestJwtUtilsForTesting.generateToken(user);
        Cookie cookie = new Cookie("session", token);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        return cookie;
    }
    
    /**
     * Create a JWT cookie for BUYER role
     */
    public static Cookie createBuyerCookie() {
        return createAuthCookie(UserRole.BUYER);
    }
    
    /**
     * Create a JWT cookie for SELLER role
     */
    public static Cookie createSellerCookie() {
        return createAuthCookie(UserRole.SELLER);
    }
    
    /**
     * Create a JWT cookie for ADMIN role
     */
    public static Cookie createAdminCookie() {
        return createAuthCookie(UserRole.ADMIN);
    }
}
