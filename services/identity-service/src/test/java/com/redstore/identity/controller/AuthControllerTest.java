package com.redstore.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.redstore.identity.TestConfig;
import com.redstore.identity.security.GoogleTokenVerifier;
import com.redstore.identity.events.publishers.SellerRegisteredPublisher;
import com.redstore.identity.events.publishers.UserLoginPublisher;
import com.redstore.identity.events.publishers.SellerLoginPublisher;
import com.redstore.identity.events.publishers.AdminLoginPublisher;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import jakarta.servlet.http.Cookie;

import static org.mockito.Mockito.when;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=test-secret-key-at-least-32-characters-long-for-identity-service",
        "JWT_KEY=test-secret-key-at-least-32-characters-long-for-identity-service",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @MockBean
    private Connection natsConnection;

    @MockBean
    private JetStream jetStream;

    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    @MockBean
    private SellerRegisteredPublisher sellerRegisteredPublisher;

    @MockBean
    private UserLoginPublisher userLoginPublisher;

    @MockBean
    private SellerLoginPublisher sellerLoginPublisher;

    @MockBean
    private AdminLoginPublisher adminLoginPublisher;

    private final String TEST_EMAIL = "test@example.com";
    private final String ADMIN_EMAIL = "jayaramnaik725@gmail.com";
    private final String SELLER_EMAIL = "seller@example.com";
    private final String MOCK_TOKEN = "mock-google-token";

    @BeforeEach
    void setUp() throws Exception {
        // Setup mock Redis ValueOperations
        ValueOperations<String, String> valueOperations = Mockito.mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);

        // Setup mock Google token verifier for regular user
        GoogleIdToken.Payload userPayload = Mockito.mock(GoogleIdToken.Payload.class);
        when(userPayload.getEmail()).thenReturn("test@example.com");
        when(userPayload.getSubject()).thenReturn("test-user-id");

        // Setup mock Google token verifier for admin
        GoogleIdToken.Payload adminPayload = Mockito.mock(GoogleIdToken.Payload.class);
        when(adminPayload.getEmail()).thenReturn("jayaramnaik725@gmail.com");
        when(adminPayload.getSubject()).thenReturn("admin-user-id");

        // Setup mock Google token verifier for seller
        GoogleIdToken.Payload sellerPayload = Mockito.mock(GoogleIdToken.Payload.class);
        when(sellerPayload.getEmail()).thenReturn("seller@example.com");
        when(sellerPayload.getSubject()).thenReturn("seller-user-id");

        // Configure different payloads for different tokens
        when(googleTokenVerifier.verify("mock-google-token")).thenReturn(userPayload);
        when(googleTokenVerifier.verify("mock-google-tokenseller")).thenReturn(sellerPayload);
        when(googleTokenVerifier.verify("mock-google-tokenadmin")).thenReturn(adminPayload);
        when(googleTokenVerifier.verify("mock-google-tokenseller")).thenReturn(sellerPayload);
        when(googleTokenVerifier.verify("mock-google-tokenadmin")).thenReturn(adminPayload);

        // Return null for missing/empty tokens (this will be handled by controller)
        when(googleTokenVerifier.verify("")).thenReturn(null);
        when(googleTokenVerifier.verify(null)).thenReturn(null);

        // Handle case where token key exists but value is empty string
        when(googleTokenVerifier.verify("")).thenReturn(null);

        // Throw exception for invalid tokens
        when(googleTokenVerifier.verify("invalid-token")).thenThrow(new RuntimeException("Invalid Google token"));
    }

    @Test
    void shouldCreateNewUserOnSignup() throws Exception {
        mockMvc.perform(post("/api/users/signup")
                        .param("email", TEST_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void shouldAuthenticateUserWithGoogle() throws Exception {
        Map<String, String> request = Map.of("token", MOCK_TOKEN);

        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void shouldAuthenticateSellerWithGoogle() throws Exception {
        Map<String, String> request = Map.of("token", MOCK_TOKEN);

        mockMvc.perform(post("/api/sellers/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void shouldAuthenticateAdminWithGoogle() throws Exception {
        Map<String, String> request = Map.of("token", "mock-google-tokenadmin");

        mockMvc.perform(post("/api/admin/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void shouldReturnCurrentUserWhenAuthenticated() throws Exception {
        // First, authenticate a user with Google login
        Map<String, String> request = Map.of("token", MOCK_TOKEN);
        
        String sessionCookie = mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("session").getValue();

        mockMvc.perform(get("/api/currentuser")
                        .cookie(new Cookie("session", sessionCookie)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.roles").exists());
    }

    @Test
    void shouldReturnEmptyUserWhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/currentuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.roles").doesNotExist());
    }

    @Test
    void shouldLogoutSuccessfully() throws Exception {
        mockMvc.perform(post("/api/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    void shouldHandleInvalidGoogleToken() throws Exception {
        Map<String, String> request = Map.of("token", "invalid-token");

        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleMissingTokenInRequest() throws Exception {
        Map<String, String> request = Map.of();

        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleEmptyTokenInRequest() throws Exception {
        Map<String, String> request = Map.of("token", "");

        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldCreateDifferentUserTypes() throws Exception {
        // Create regular user
        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of("token", MOCK_TOKEN))))
                .andExpect(status().isOk());

        // Create seller
        mockMvc.perform(post("/api/sellers/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of("token", MOCK_TOKEN + "seller"))))
                .andExpect(status().isOk());

        // Create admin
        mockMvc.perform(post("/api/admin/google")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of("token", MOCK_TOKEN + "admin"))))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleInvalidEndpoint() throws Exception {
        mockMvc.perform(post("/api/invalid/endpoint")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of("token", MOCK_TOKEN))))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldHandleMalformedJson() throws Exception {
        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldHandleEmptyRequestBody() throws Exception {
        mockMvc.perform(post("/api/users/google")
                        .contentType("application/json")
                        .content(""))
                .andExpect(status().isBadRequest());
    }
}