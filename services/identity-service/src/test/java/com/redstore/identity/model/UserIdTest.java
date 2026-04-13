package com.redstore.identity.model;

import com.redstore.common.enums.UserRole;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserIdTest {

    private final String TEST_EMAIL = "test@example.com";
    private final UserRole TEST_ROLE = UserRole.BUYER;

    @Test
    void shouldCreateUserIdWithNoArgsConstructor() {
        // When
        UserId userId = new UserId();

        // Then
        assertNotNull(userId);
        assertNull(userId.getEmail());
        assertNull(userId.getRole());
    }

    @Test
    void shouldCreateUserIdWithAllArgsConstructor() {
        // When
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // Then
        assertEquals(TEST_EMAIL, userId.getEmail());
        assertEquals(TEST_ROLE, userId.getRole());
    }

    @Test
    void shouldSetAndGetEmail() {
        // Given
        UserId userId = new UserId();

        // When
        userId.setEmail(TEST_EMAIL);

        // Then
        assertEquals(TEST_EMAIL, userId.getEmail());
    }

    @Test
    void shouldSetAndGetRole() {
        // Given
        UserId userId = new UserId();

        // When
        userId.setRole(TEST_ROLE);

        // Then
        assertEquals(TEST_ROLE, userId.getRole());
    }

    @Test
    void shouldHandleNullEmail() {
        // Given
        UserId userId = new UserId();

        // When
        userId.setEmail(null);

        // Then
        assertNull(userId.getEmail());
    }

    @Test
    void shouldHandleNullRole() {
        // Given
        UserId userId = new UserId();

        // When
        userId.setRole(null);

        // Then
        assertNull(userId.getRole());
    }

    @Test
    void shouldHandleEmptyEmail() {
        // Given
        UserId userId = new UserId();

        // When
        userId.setEmail("");

        // Then
        assertEquals("", userId.getEmail());
    }

    @Test
    void shouldSupportAllUserRoles() {
        // Test each role
        for (UserRole role : UserRole.values()) {
            UserId userId = new UserId(TEST_EMAIL, role);

            assertEquals(TEST_EMAIL, userId.getEmail());
            assertEquals(role, userId.getRole());
        }
    }

    @Test
    void shouldImplementEqualsCorrectly() {
        // Given
        UserId userId1 = new UserId(TEST_EMAIL, TEST_ROLE);
        UserId userId2 = new UserId(TEST_EMAIL, TEST_ROLE);
        UserId userId3 = new UserId("different@example.com", TEST_ROLE);
        UserId userId4 = new UserId(TEST_EMAIL, UserRole.SELLER);

        // Then
        assertEquals(userId1, userId2);
        assertNotEquals(userId1, userId3);
        assertNotEquals(userId1, userId4);
        assertNotEquals(userId1, null);
        assertNotEquals(userId1, "string");
    }

    @Test
    void shouldImplementHashCodeCorrectly() {
        // Given
        UserId userId1 = new UserId(TEST_EMAIL, TEST_ROLE);
        UserId userId2 = new UserId(TEST_EMAIL, TEST_ROLE);
        UserId userId3 = new UserId("different@example.com", TEST_ROLE);

        // Then
        assertEquals(userId1.hashCode(), userId2.hashCode());
        assertNotEquals(userId1.hashCode(), userId3.hashCode());
    }

    @Test
    void shouldHaveConsistentHashCode() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When
        int hashCode1 = userId.hashCode();
        int hashCode2 = userId.hashCode();

        // Then
        assertEquals(hashCode1, hashCode2);
    }

    @Test
    void shouldImplementToString() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When
        String userIdString = userId.toString();

        // Then
        assertNotNull(userIdString);
        assertTrue(userIdString.contains("UserId"));
    }

    @Test
    void shouldHandleEmailCaseSensitivity() {
        // Given
        UserId userId1 = new UserId("test@example.com", TEST_ROLE);
        UserId userId2 = new UserId("Test@example.com", TEST_ROLE);

        // Then
        assertNotEquals(userId1, userId2); // Email should be case-sensitive
    }

    @Test
    void shouldHandleEmailWithSpecialCharacters() {
        // Given
        String specialEmail = "test.email+tag@example.com";

        // When
        UserId userId = new UserId(specialEmail, TEST_ROLE);

        // Then
        assertEquals(specialEmail, userId.getEmail());
        assertEquals(TEST_ROLE, userId.getRole());
    }

    @Test
    void shouldHandleLongEmail() {
        // Given
        String longEmail = "very.long.email.address.that.exceeds.normal.length.but.is.still.valid@example.com";

        // When
        UserId userId = new UserId(longEmail, TEST_ROLE);

        // Then
        assertEquals(longEmail, userId.getEmail());
        assertEquals(TEST_ROLE, userId.getRole());
    }

    @Test
    void shouldMaintainImmutabilityInEquals() {
        // Given
        UserId userId1 = new UserId(TEST_EMAIL, TEST_ROLE);
        UserId userId2 = new UserId(TEST_EMAIL, TEST_ROLE);

        // When
        userId2.setEmail("different@example.com");

        // Then
        assertNotEquals(userId1, userId2);
    }

    @Test
    void shouldHandleRoleChanges() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);

        // When
        userId.setRole(UserRole.SELLER);

        // Then
        assertEquals(UserRole.SELLER, userId.getRole());
        assertEquals(TEST_EMAIL, userId.getEmail());
    }

    @Test
    void shouldHandleEmailChanges() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When
        userId.setEmail("new@example.com");

        // Then
        assertEquals("new@example.com", userId.getEmail());
        assertEquals(TEST_ROLE, userId.getRole());
    }

    @Test
    void shouldHandleSerializableInterface() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When & Then - Should implement Serializable
        assertDoesNotThrow(() -> {
            // This would be used in serialization scenarios
            Object obj = userId;
            assertTrue(obj instanceof java.io.Serializable);
        });
    }

    @Test
    void shouldHandleEmbeddableAnnotation() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, TEST_ROLE);

        // When & Then - Should be properly annotated for JPA
        assertDoesNotThrow(() -> {
            // The @Embeddable annotation would be processed by JPA
            Class<?> clazz = userId.getClass();
            assertTrue(clazz.isAnnotationPresent(jakarta.persistence.Embeddable.class));
        });
    }
}
