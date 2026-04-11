package com.redstore.common.utils;

import com.redstore.common.dto.UserPayload;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class CurrentUserInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 1. First try to get JWT from Authorization Header
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // 2. If no header, try to get JWT from cookie
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("session".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (token != null) {
            try {
                // 3. Verify Token using our JwtUtils
                UserPayload payload = JwtUtils.validateAndGetPayload(token);
                // 4. Attach to Context (Like req.currentUser = payload)
                UserContext.setUser(payload);
            } catch (Exception e) {
                // Invalid token, clear context
                UserContext.clear();
            }
        }

        return true; // Always continue to the controller
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear(); // Clean up after the request is finished
    }
}