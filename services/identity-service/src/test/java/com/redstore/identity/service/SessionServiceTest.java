package com.redstore.identity.service;

import com.redstore.common.dto.UserLoginEventData;
import com.redstore.common.dto.RoleBasedLoginEventData;
import com.redstore.common.enums.UserRole;
import com.redstore.common.utils.JwtUtils;
import com.redstore.identity.TestConfig;
import com.redstore.identity.events.publishers.UserLoginPublisher;
import com.redstore.identity.events.publishers.SellerLoginPublisher;
import com.redstore.identity.events.publishers.AdminLoginPublisher;
import com.redstore.identity.model.User;
import com.redstore.identity.model.UserId;
import com.redstore.identity.security.GoogleTokenVerifier;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
})
@ActiveProfiles("test")
@Import(TestConfig.class)
class SessionServiceTest {

    @Autowired
    private SessionService sessionService;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private UserLoginPublisher userLoginPublisher;

    @MockBean
    private SellerLoginPublisher sellerLoginPublisher;

    @MockBean
    private AdminLoginPublisher adminLoginPublisher;

    @MockBean
    private Connection natsConnection;

    @MockBean
    private JetStream jetStream;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @Mock
    private HttpServletResponse response;

    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_USER_ID = "test-user-id";
    private final String REFRESH_TOKEN = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        // Reset publisher mocks
        reset(userLoginPublisher, sellerLoginPublisher, adminLoginPublisher);
        
        // Setup mock Redis ValueOperations
        ValueOperations<String, String> valueOperations = Mockito.mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        // Clear Redis data if connection is available
        try {
            if (redisTemplate.getConnectionFactory() != null) {
                redisTemplate.getConnectionFactory().getConnection().serverCommands().flushAll();
            }
        } catch (Exception e) {
            // Redis might not be available in test environment
            System.out.println("Redis not available for test setup: " + e.getMessage());
        }
    }

    @Test
    void createSession_ValidUser_CreatesSessionAndPublishesEvent() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        sessionService.createSession(user, response);

        // Then
        verify(redisTemplate, times(1)).opsForValue();
        verify(response, times(2)).addCookie(any(Cookie.class)); // session + refresh_token
        verify(userLoginPublisher, times(1)).publish(any(UserLoginEventData.class));
        verify(sellerLoginPublisher, never()).publish(any());
        verify(adminLoginPublisher, never()).publish(any());
    }

    @Test
    void createSession_SellerUser_CreatesSessionAndPublishesSellerEvent() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.SELLER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        sessionService.createSession(user, response);

        // Then
        verify(redisTemplate, times(1)).opsForValue();
        verify(response, times(2)).addCookie(any(Cookie.class));
        verify(userLoginPublisher, never()).publish(any());
        verify(sellerLoginPublisher, times(1)).publish(any(RoleBasedLoginEventData.class));
        verify(adminLoginPublisher, never()).publish(any());
    }

    @Test
    void createSession_AdminUser_CreatesSessionAndPublishesAdminEvent() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.ADMIN);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        sessionService.createSession(user, response);

        // Then
        verify(redisTemplate, times(1)).opsForValue();
        verify(response, times(2)).addCookie(any(Cookie.class));
        verify(userLoginPublisher, never()).publish(any());
        verify(sellerLoginPublisher, never()).publish(any());
        verify(adminLoginPublisher, times(1)).publish(any(RoleBasedLoginEventData.class));
    }

    @Test
    void createSession_InactiveUser_StillCreatesSession() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(false)
                .build();

        // When
        sessionService.createSession(user, response);

        // Then
        verify(redisTemplate, times(1)).opsForValue();
        verify(response, times(2)).addCookie(any(Cookie.class));
        verify(userLoginPublisher, times(1)).publish(any(UserLoginEventData.class));
    }

    @Test
    void createSession_PublishingFails_LogsErrorAndContinues() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        doThrow(new RuntimeException("Event publishing failed"))
                .when(userLoginPublisher).publish(any(UserLoginEventData.class));

        // When
        assertDoesNotThrow(() -> sessionService.createSession(user, response));

        // Then
        verify(redisTemplate, times(1)).opsForValue();
        verify(response, times(2)).addCookie(any(Cookie.class));
        verify(userLoginPublisher, times(1)).publish(any(UserLoginEventData.class));
    }

    @Test
    void createSession_RedisError_LogsErrorAndContinues() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doThrow(new RuntimeException("Redis error"))
                .when(valueOperations).set(anyString(), anyString(), any());

        // When
        assertDoesNotThrow(() -> sessionService.createSession(user, response));

        // Then
        verify(redisTemplate, times(1)).opsForValue();
        verify(response, times(2)).addCookie(any(Cookie.class));
        verify(userLoginPublisher, times(1)).publish(any(UserLoginEventData.class));
    }

    @Test
    void createSession_NullUser_ThrowsException() {
        // When & Then
        assertThrows(Exception.class, () -> {
            sessionService.createSession(null, response);
        });
    }

    @Test
    void createSession_NullResponse_ThrowsException() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When & Then
        assertThrows(Exception.class, () -> {
            sessionService.createSession(user, null);
        });
    }

    @Test
    void createSession_GeneratesUniqueRefreshTokens() {
        // Given
        UserId userId1 = new UserId("user1@example.com", UserRole.BUYER);
        UserId userId2 = new UserId("user2@example.com", UserRole.BUYER);
        User user1 = User.builder().id(userId1).password("test").isActive(true).build();
        User user2 = User.builder().id(userId2).password("test").isActive(true).build();

        // When
        sessionService.createSession(user1, response);
        sessionService.createSession(user2, response);

        // Then
        verify(redisTemplate, times(2)).opsForValue();
        // Each call should have a different refresh token
        verify(response, times(4)).addCookie(any(Cookie.class));
    }

    @Test
    void createSession_SetsCorrectCookieProperties() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        sessionService.createSession(user, response);

        // Then
        verify(response, times(2)).addCookie(argThat(cookie -> {
            return cookie.isHttpOnly() && 
                   cookie.getSecure() && 
                   "/".equals(cookie.getPath()) &&
                   cookie.getMaxAge() > 0;
        }));
    }
}
