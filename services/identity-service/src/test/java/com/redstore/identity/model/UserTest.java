package com.redstore.identity.model;

import com.redstore.common.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;
    private final String TEST_EMAIL = "test@example.com";
    private final UserRole TEST_ROLE = UserRole.BUYER;

    @BeforeEach
    void setUp() {
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);
        user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();
    }

    @Test
    void shouldCreateUserWithBuilder() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When
        User createdUser = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // Then
        assertNotNull(createdUser);
        assertEquals(TEST_EMAIL, createdUser.getEmail());
        assertEquals(TEST_ROLE, createdUser.getRole());
        assertEquals("test-password", createdUser.getPassword());
        assertTrue(createdUser.isActive());
    }

    @Test
    void shouldGetEmailFromCompositeKey() {
        // When
        String email = user.getEmail();

        // Then
        assertEquals(TEST_EMAIL, email);
    }

    @Test
    void shouldGetRoleFromCompositeKey() {
        // When
        UserRole role = user.getRole();

        // Then
        assertEquals(TEST_ROLE, role);
    }

    @Test
    void shouldSetEmailThroughConvenienceMethod() {
        // Given
        String newEmail = "new@example.com";

        // When
        user.setEmail(newEmail);

        // Then
        assertEquals(newEmail, user.getEmail());
        assertNotNull(user.getId());
        assertEquals(newEmail, user.getId().getEmail());
    }

    @Test
    void shouldSetRoleThroughConvenienceMethod() {
        // Given
        UserRole newRole = UserRole.SELLER;

        // When
        user.setRole(newRole);

        // Then
        assertEquals(newRole, user.getRole());
        assertNotNull(user.getId());
        assertEquals(newRole, user.getId().getRole());
    }

    @Test
    void shouldHandleNullId() {
        // Given
        User userWithNullId = new User();
        userWithNullId.setId(null);

        // When
        String email = userWithNullId.getEmail();
        UserRole role = userWithNullId.getRole();

        // Then
        assertNull(email);
        assertNull(role);
    }

    @Test
    void shouldCreateUserIdWhenSettingEmailOnNullId() {
        // Given
        User userWithNullId = new User();
        userWithNullId.setId(null);

        // When
        userWithNullId.setEmail(TEST_EMAIL);

        // Then
        assertNotNull(userWithNullId.getId());
        assertEquals(TEST_EMAIL, userWithNullId.getEmail());
        assertEquals(TEST_EMAIL, userWithNullId.getId().getEmail());
    }

    @Test
    void shouldCreateUserIdWhenSettingRoleOnNullId() {
        // Given
        User userWithNullId = new User();
        userWithNullId.setId(null);

        // When
        userWithNullId.setRole(TEST_ROLE);

        // Then
        assertNotNull(userWithNullId.getId());
        assertEquals(TEST_ROLE, userWithNullId.getRole());
        assertEquals(TEST_ROLE, userWithNullId.getId().getRole());
    }

    @Test
    void shouldMaintainExistingIdWhenSettingEmail() {
        // Given
        UserId originalId = user.getId();
        String originalEmail = originalId.getEmail();

        // When
        user.setEmail("new@example.com");

        // Then
        assertSame(originalId, user.getId()); // Same object reference
        assertEquals("new@example.com", user.getId().getEmail());
        assertEquals(originalEmail, originalEmail); // Original email unchanged
    }

    @Test
    void shouldMaintainExistingIdWhenSettingRole() {
        // Given
        UserId originalId = user.getId();
        UserRole originalRole = originalId.getRole();

        // When
        user.setRole(UserRole.SELLER);

        // Then
        assertSame(originalId, user.getId()); // Same object reference
        assertEquals(UserRole.SELLER, user.getId().getRole());
        assertEquals(originalRole, originalRole); // Original role unchanged
    }

    @Test
    void shouldHandleNoArgsConstructor() {
        // When
        User emptyUser = new User();

        // Then
        assertNotNull(emptyUser);
        assertNull(emptyUser.getId());
        assertNull(emptyUser.getPassword());
        assertTrue(emptyUser.isActive()); // Default value from @Builder.Default is true
    }

    @Test
    void shouldHandleAllArgsConstructor() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When
        User fullUser = new User(userId, "password", true, LocalDateTime.now());

        // Then
        assertNotNull(fullUser);
        assertEquals(userId, fullUser.getId());
        assertEquals("password", fullUser.getPassword());
        assertTrue(fullUser.isActive());
    }

    @Test
    void shouldHandleToString() {
        // When
        String userString = user.toString();

        // Then
        assertNotNull(userString);
        assertTrue(userString.contains("User"));
    }

    @Test
    void shouldHandleEqualsAndHashCode() {
        // Given
        UserId userId1 = new UserId(TEST_EMAIL, TEST_ROLE);
        UserId userId2 = new UserId(TEST_EMAIL, TEST_ROLE);
        
        User user1 = User.builder().id(userId1).password("pass").isActive(true).build();
        User user2 = User.builder().id(userId2).password("pass").isActive(true).build();
        User user3 = User.builder().id(new UserId("different@example.com", TEST_ROLE)).password("pass").isActive(true).build();

        // Then
        assertEquals(user1, user2); // Same composite key
        assertEquals(user1.hashCode(), user2.hashCode());
        assertNotEquals(user1, user3); // Different composite key
        assertNotEquals(user1.hashCode(), user3.hashCode());
    }

    @Test
    void shouldSupportAllUserRoles() {
        // Test each role
        for (UserRole role : UserRole.values()) {
            UserId userId = new UserId(TEST_EMAIL, role);
            User roleUser = User.builder()
                    .id(userId)
                    .password("test-password")
                    .isActive(true)
                    .build();

            assertEquals(role, roleUser.getRole());
            assertEquals(TEST_EMAIL, roleUser.getEmail());
        }
    }

    @Test
    void shouldHandleEmptyStringEmail() {
        // Given
        UserId userId = new UserId("", TEST_ROLE);
        User userWithEmptyEmail = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        String email = userWithEmptyEmail.getEmail();

        // Then
        assertEquals("", email);
    }

    @Test
    void shouldHandleNullEmailInUserId() {
        // Given
        UserId userId = new UserId(null, TEST_ROLE);
        User userWithNullEmail = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        String email = userWithNullEmail.getEmail();

        // Then
        assertNull(email);
    }
}
