package com.redstore.common.utils;

import com.redstore.common.dto.UserPayload;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class CurrentUserInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 1. Get JWT from Header (Node uses session, Java typically uses Bearer Header)
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                // 2. Verify Token using our JwtUtils
                UserPayload payload = JwtUtils.validateAndGetPayload(token);

                // 3. Attach to Context (Like req.currentUser = payload)
                UserContext.setUser(payload);
            } catch (Exception e) {
                // Like your empty catch block in Node
            }
        }
        return true; // Always continue to the controller
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear(); // Clean up after the request is finished
    }
}