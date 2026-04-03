package com.redstore.identity.controller;

import com.redstore.identity.model.User;
import com.redstore.identity.repository.UserRepository;
import com.redstore.identity.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // This will be your "Check or Create" endpoint for Google Login later
    @PostMapping("/signup")
    public User signup(@RequestParam("email") String email) {
        return authService.registerOrFindUser(email);
    }

}