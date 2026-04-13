package com.redstore.identity.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.redstore.common.enums.UserRole;
import com.redstore.identity.TestConfig;
import com.redstore.identity.model.User;
import com.redstore.identity.model.UserId;
import com.redstore.identity.repository.UserRepository;
import com.redstore.identity.events.publishers.SellerRegisteredPublisher;
import com.redstore.identity.security.GoogleTokenVerifier;
import io.nats.client.Connection;
import io.nats.client.JetStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
})
@ActiveProfiles("test")
@Import(TestConfig.class)
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SellerRegisteredPublisher sellerRegisteredPublisher;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @MockBean
    private Connection natsConnection;

    @MockBean
    private JetStream jetStream;

    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    private final String TEST_EMAIL = "test@example.com";
    private final String ADMIN_EMAIL = "jayaramnaik725@gmail.com";

    @BeforeEach
    void setUp() throws Exception {
        // Reset mocks before each test
        reset(userRepository, sellerRegisteredPublisher);
        
        // Setup mock Redis ValueOperations
        ValueOperations<String, String> valueOperations = Mockito.mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        
        // Setup mock Google token verifier
        GoogleIdToken.Payload mockPayload = Mockito.mock(GoogleIdToken.Payload.class);
        when(mockPayload.getEmail()).thenReturn("test@example.com");
        when(mockPayload.getSubject()).thenReturn("test-user-id");
        
        when(googleTokenVerifier.verify("mock-google-token")).thenReturn(mockPayload);
        when(googleTokenVerifier.verify("mock-google-tokenseller")).thenReturn(mockPayload);
        when(googleTokenVerifier.verify("mock-google-tokenadmin")).thenReturn(mockPayload);
        
        // Return null for missing/empty tokens (this will be handled by controller)
        when(googleTokenVerifier.verify("")).thenReturn(null);
        when(googleTokenVerifier.verify(null)).thenReturn(null);
        
        // Throw exception for invalid tokens
        when(googleTokenVerifier.verify("invalid-token")).thenThrow(new RuntimeException("Invalid Google token"));
    }

    @Test
    void registerOrFindUser_ExistingUser_ReturnsExistingUser() {
        // Given
        UserRole role = UserRole.BUYER;
        UserId userId = new UserId(TEST_EMAIL, role);
        User existingUser = User.builder()
                .id(userId)
                .password("existing-password")
                .isActive(true)
                .build();

        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, role))
                .thenReturn(Optional.of(existingUser));

        // When
        User result = authService.registerOrFindUser(TEST_EMAIL, role);

        // Then
        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(role, result.getRole());
        verify(userRepository, never()).save(any(User.class));
        verify(sellerRegisteredPublisher, never()).publish(any());
    }

    @Test
    void registerOrFindUser_NewUser_CreatesAndReturnsUser() {
        // Given
        UserRole role = UserRole.BUYER;
        UserId userId = new UserId(TEST_EMAIL, role);
        User newUser = User.builder()
                .id(userId)
                .password("GOOGLE_AUTH_USER")
                .isActive(true)
                .build();

        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, role))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // When
        User result = authService.registerOrFindUser(TEST_EMAIL, role);

        // Then
        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(role, result.getRole());
        assertEquals("GOOGLE_AUTH_USER", result.getPassword());
        assertTrue(result.isActive());
        verify(userRepository, times(1)).save(any(User.class));
        verify(sellerRegisteredPublisher, never()).publish(any());
    }

    @Test
    void registerOrFindUser_NewSeller_CreatesUserAndPublishesEvent() {
        // Given
        UserRole role = UserRole.SELLER;
        UserId userId = new UserId(TEST_EMAIL, role);
        User newSeller = User.builder()
                .id(userId)
                .password("GOOGLE_AUTH_USER")
                .isActive(true)
                .build();

        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, role))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newSeller);

        // When
        User result = authService.registerOrFindUser(TEST_EMAIL, role);

        // Then
        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(role, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
        verify(sellerRegisteredPublisher, times(1)).publish(any());
    }

    @Test
    void registerOrFindUser_NewAdmin_CreatesUserWithoutEvent() {
        // Given
        UserRole role = UserRole.ADMIN;
        UserId userId = new UserId(TEST_EMAIL, role);
        User newAdmin = User.builder()
                .id(userId)
                .password("GOOGLE_AUTH_USER")
                .isActive(true)
                .build();

        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, role))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newAdmin);

        // When
        User result = authService.registerOrFindUser(TEST_EMAIL, role);

        // Then
        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(role, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
        verify(sellerRegisteredPublisher, never()).publish(any());
    }

    @Test
    void registerOrFindUser_BackwardCompatibility_DefaultsToBuyer() {
        // Given
        UserRole defaultRole = UserRole.BUYER;
        UserId userId = new UserId(TEST_EMAIL, defaultRole);
        User existingUser = User.builder()
                .id(userId)
                .password("existing-password")
                .isActive(true)
                .build();

        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, defaultRole))
                .thenReturn(Optional.of(existingUser));

        // When
        User result = authService.registerOrFindUser(TEST_EMAIL);

        // Then
        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(defaultRole, result.getRole());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerOrFindUser_DatabaseError_ThrowsException() {
        // Given
        UserRole role = UserRole.BUYER;
        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, role))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            authService.registerOrFindUser(TEST_EMAIL, role);
        });
    }

    @Test
    void registerOrFindUser_SellerEventPublishingError_LogsErrorAndContinues() {
        // Given
        UserRole role = UserRole.SELLER;
        UserId userId = new UserId(TEST_EMAIL, role);
        User newSeller = User.builder()
                .id(userId)
                .password("GOOGLE_AUTH_USER")
                .isActive(true)
                .build();

        when(userRepository.findById_EmailAndId_Role(TEST_EMAIL, role))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newSeller);
        doThrow(new RuntimeException("Event publishing failed"))
                .when(sellerRegisteredPublisher).publish(any());

        // When
        User result = authService.registerOrFindUser(TEST_EMAIL, role);

        // Then
        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(role, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
        verify(sellerRegisteredPublisher, times(1)).publish(any());
    }
}
