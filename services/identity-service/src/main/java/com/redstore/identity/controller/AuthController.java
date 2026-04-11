package com.redstore.identity.controller;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.utils.UserContext;
import com.redstore.identity.model.User;
import com.redstore.identity.service.AuthService;
import com.redstore.identity.service.SessionService; 
import com.redstore.identity.security.GoogleTokenVerifier;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final SessionService sessionService; // Injected your new service
    private final StringRedisTemplate redisTemplate;

    // TEMP endpoint (keep for testing)
    @PostMapping("/signup")
    public User signup(@RequestParam("email") String email) {
        return authService.registerOrFindUser(email);
    }

    // Google Login endpoint
    @PostMapping("/google")
    public User googleLogin(@RequestBody Map<String, String> request, HttpServletResponse response) throws Exception {

        String token = request.get("token");

        var payload = googleTokenVerifier.verify(token);

        // once email is verified get the email
        String email = payload.getEmail();

        // get the user from authService
        User user = authService.registerOrFindUser(email);

        // ALL the payload, JWT, Redis, and Cookie logic handled here now!
        sessionService.createSession(user, response);

        return user;
    }

    // Current User endpoint - checks ThreadLocal (no cookie needed)
    @GetMapping("/currentuser")
    public UserPayload getCurrentUser() {
        // Get user from ThreadLocal (already verified by interceptor)
        UserPayload currentUser = UserContext.getUser();
        
        if (currentUser != null) {
            return currentUser;
        } else {
            // Return empty user if no user in ThreadLocal
            return new UserPayload();
        }
    }

    // Logout endpoint - clear cookies and Redis
    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Get current user from ThreadLocal
            UserPayload currentUser = UserContext.getUser();
            
            // Clear refresh token from Redis if user exists
            if (currentUser != null) {
                Cookie[] cookies = request.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if ("refresh_token".equals(cookie.getName())) {
                            String refreshToken = cookie.getValue();
                            String redisKey = "refresh_token:" + refreshToken;
                            redisTemplate.delete(redisKey);
                            break;
                        }
                    }
                }
            }

            // Clear cookies - match how they were set (no explicit domain)
            Cookie sessionCookie = new Cookie("session", "");
            sessionCookie.setHttpOnly(true);
            sessionCookie.setSecure(true);
            sessionCookie.setPath("/");
            sessionCookie.setMaxAge(0);
            response.addCookie(sessionCookie);

            Cookie refreshTokenCookie = new Cookie("refresh_token", "");
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(0);
            response.addCookie(refreshTokenCookie);

            return Map.of("message", "Logged out successfully");
        } catch (Exception e) {
            // Still clear cookies even if Redis cleanup fails
            Cookie sessionCookie = new Cookie("session", "");
            sessionCookie.setHttpOnly(true);
            sessionCookie.setSecure(true);
            sessionCookie.setPath("/");
            sessionCookie.setMaxAge(0);
            response.addCookie(sessionCookie);

            Cookie refreshTokenCookie = new Cookie("refresh_token", "");
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(0);
            response.addCookie(refreshTokenCookie);

            return Map.of("message", "Logged out successfully (partial cleanup)");
        }
    }
}