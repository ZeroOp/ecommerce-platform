package com.redstore.identity.controller;

import com.redstore.identity.model.User;
import com.redstore.identity.service.AuthService;
import com.redstore.identity.service.SessionService; // 👈 Make sure to import this
import com.redstore.identity.security.GoogleTokenVerifier;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final SessionService sessionService; // 👈 Injected your new service

    // TEMP endpoint (keep for testing)
    @PostMapping("/signup")
    public User signup(@RequestParam("email") String email) {
        return authService.registerOrFindUser(email);
    }

    // ✅ Google Login endpoint
    @PostMapping("/google")
    public User googleLogin(@RequestBody Map<String, String> request, HttpServletResponse response) throws Exception {

        String token = request.get("token");

        var payload = googleTokenVerifier.verify(token);

        // once email is verified get the email
        String email = payload.getEmail();

        // get the user from authService
        User user = authService.registerOrFindUser(email);

        // 👈 ALL the payload, JWT, Redis, and Cookie logic handled here now!
        sessionService.createSession(user, response);

        return user;
    }
}