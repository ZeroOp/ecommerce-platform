package com.redstore.identity.controller;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.utils.UserContext;
import com.redstore.common.enums.UserRole;
import com.redstore.identity.model.User;
import com.redstore.identity.service.AuthService;
import com.redstore.identity.service.SessionService; 
import com.redstore.identity.security.GoogleTokenVerifier;
import com.redstore.identity.events.publishers.UserLogoutPublisher;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final SessionService sessionService; // Injected your new service
    private final StringRedisTemplate redisTemplate;
    private final UserLogoutPublisher userLogoutPublisher;

    // TEMP endpoint (keep for testing)
    @PostMapping("/users/signup")
    public User signup(@RequestParam("email") String email) {
        return authService.registerOrFindUser(email, UserRole.BUYER);
    }

    // User Google Login endpoint
    @PostMapping("/users/google")
    public User userGoogleLogin(@RequestBody Map<String, String> request, HttpServletResponse response) throws Exception {

        String token = request.get("token");

        var payload = googleTokenVerifier.verify(token);

        // Check if payload is null (invalid/missing token)
        if (payload == null) {
            throw new Exception("Invalid or missing Google token");
        }

        // once email is verified get the email
        String email = payload.getEmail();

        // get the user from authService with BUYER role
        User user = authService.registerOrFindUser(email, UserRole.BUYER);

        // ALL the payload, JWT, Redis, and Cookie logic handled here now!
        sessionService.createSession(user, response);

        return user;
    }

    // Seller Google Login endpoint
    @PostMapping("/sellers/google")
    public User sellerGoogleLogin(@RequestBody Map<String, String> request, HttpServletResponse response) throws Exception {

        String token = request.get("token");

        var payload = googleTokenVerifier.verify(token);

        // Check if payload is null (invalid/missing token)
        if (payload == null) {
            throw new Exception("Invalid or missing Google token");
        }

        // once email is verified get the email
        String email = payload.getEmail();

        // get the user from authService with SELLER role
        User user = authService.registerOrFindUser(email, UserRole.SELLER);

        // Check if seller is approved (you can add this logic in AuthService)
        if (user.getRole() != UserRole.SELLER) {
            throw new Exception("Seller account not found or not approved");
        }

        // ALL the payload, JWT, Redis, and Cookie logic handled here now!
        sessionService.createSession(user, response);

        return user;
    }

    // Admin Google Login endpoint (only jayaramnaik725@gmail.com)
    @PostMapping("/admin/google")
    public User adminGoogleLogin(@RequestBody Map<String, String> request, HttpServletResponse response) throws Exception {

        String token = request.get("token");

        var payload = googleTokenVerifier.verify(token);

        // Check if payload is null (invalid/missing token)
        if (payload == null) {
            throw new Exception("Invalid or missing Google token");
        }

        // once email is verified get the email
        String email = payload.getEmail();

        // Check if email matches admin email
        if (!"jayaramnaik725@gmail.com".equals(email)) {
            throw new Exception("Access denied. Only authorized admin can access this page.");
        }

        // get the user from authService with ADMIN role
        User user = authService.registerOrFindUser(email, UserRole.ADMIN);

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

            // Publish logout event if user exists
            if (currentUser != null) {
                try {
                    userLogoutPublisher.publish(new com.redstore.common.dto.UserLogoutEventData(
                        currentUser.getEmail(),
                        currentUser.getRole()
                    ));
                    System.out.println("Logout event published for user: " + currentUser.getEmail());
                } catch (Exception e) {
                    System.err.println("Failed to publish logout event: " + e.getMessage());
                }
            }

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

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMessageNotReadableException(HttpMessageNotReadableException e) {
        return ResponseEntity.status(400)
                .body(Map.of("error", "Invalid request format"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        String errorMessage = e.getMessage() != null ? e.getMessage() : "Internal server error occurred";
        return ResponseEntity.status(500)
                .body(Map.of("error", errorMessage));
    }
}