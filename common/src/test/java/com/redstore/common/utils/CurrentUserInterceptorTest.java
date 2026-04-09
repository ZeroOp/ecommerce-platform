package com.redstore.common.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CurrentUserInterceptorTest {

    private CurrentUserInterceptor interceptor;
    private HttpServletRequest request;
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new CurrentUserInterceptor();
        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
        UserContext.clear();
    }

    @Test
    void shouldSetContextWhenValidBearerTokenPresent() {
        // 1. Create a real token
        String token = Jwts.builder()
                .subject("abc-123")
                .claim("email", "interceptor@test.com")
                .signWith(JwtUtils.getSigningKey())
                .compact();

        // 2. Mock the header call
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        // 3. Run preHandle
        boolean proceed = interceptor.preHandle(request, response, new Object());

        // 4. Assertions
        assertTrue(proceed); // Interceptor should always return true (never block)
        assertNotNull(UserContext.getUser());
        assertEquals("interceptor@test.com", UserContext.getUser().getEmail());
    }

    @Test
    void shouldNotSetContextWhenHeaderIsMissing() {
        when(request.getHeader("Authorization")).thenReturn(null);

        interceptor.preHandle(request, response, new Object());

        assertNull(UserContext.getUser());
    }

    @Test
    void shouldClearContextInAfterCompletion() {
        // Set a dummy user
        UserContext.setUser(null);

        interceptor.afterCompletion(request, response, new Object(), null);

        assertNull(UserContext.getUser());
    }
}