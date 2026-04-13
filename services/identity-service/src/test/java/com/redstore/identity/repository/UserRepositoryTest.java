package com.redstore.identity.repository;

import com.redstore.common.enums.UserRole;
import com.redstore.identity.model.User;
import com.redstore.identity.model.UserId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_EMAIL_2 = "test2@example.com";

    @Test
    void shouldSaveAndFindUserByCompositeKey() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();

        // When
        User savedUser = userRepository.save(user);

        // Then
        assertNotNull(savedUser);
        assertEquals(TEST_EMAIL, savedUser.getEmail());
        assertEquals(UserRole.BUYER, savedUser.getRole());
        assertTrue(savedUser.isActive());
    }

    @Test
    void shouldFindUserByEmailAndRole() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findById_EmailAndId_Role(TEST_EMAIL, UserRole.BUYER);

        // Then
        assertTrue(foundUser.isPresent());
        assertEquals(TEST_EMAIL, foundUser.get().getEmail());
        assertEquals(UserRole.BUYER, foundUser.get().getRole());
    }

    @Test
    void shouldNotFindUserByNonExistentEmailAndRole() {
        // When
        Optional<User> foundUser = userRepository.findById_EmailAndId_Role("nonexistent@example.com", UserRole.BUYER);

        // Then
        assertFalse(foundUser.isPresent());
    }

    @Test
    void shouldNotFindUserByWrongRole() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findById_EmailAndId_Role(TEST_EMAIL, UserRole.SELLER);

        // Then
        assertFalse(foundUser.isPresent());
    }

    @Test
    void shouldAllowMultipleUsersWithSameEmailAndDifferentRoles() {
        // Given
        UserId buyerId = new UserId(TEST_EMAIL, UserRole.BUYER);
        UserId sellerId = new UserId(TEST_EMAIL, UserRole.SELLER);
        
        User buyer = User.builder()
                .id(buyerId)
                .password("buyer-password")
                .isActive(true)
                .build();
        
        User seller = User.builder()
                .id(sellerId)
                .password("seller-password")
                .isActive(true)
                .build();

        // When
        User savedBuyer = userRepository.save(buyer);
        User savedSeller = userRepository.save(seller);

        // Then
        assertNotNull(savedBuyer);
        assertNotNull(savedSeller);
        assertEquals(TEST_EMAIL, savedBuyer.getEmail());
        assertEquals(TEST_EMAIL, savedSeller.getEmail());
        assertEquals(UserRole.BUYER, savedBuyer.getRole());
        assertEquals(UserRole.SELLER, savedSeller.getRole());
    }

    @Test
    void shouldFindUserByEmail() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user);

        // When
        List<User> foundUsers = userRepository.findById_Email(TEST_EMAIL);

        // Then
        assertEquals(1, foundUsers.size());
        assertEquals(TEST_EMAIL, foundUsers.get(0).getEmail());
    }

    @Test
    void shouldCheckIfUserExistsByEmailAndRole() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user);

        // When
        boolean exists = userRepository.existsById_EmailAndId_Role(TEST_EMAIL, UserRole.BUYER);
        boolean notExists = userRepository.existsById_EmailAndId_Role(TEST_EMAIL, UserRole.SELLER);

        // Then
        assertTrue(exists);
        assertFalse(notExists);
    }

    @Test
    void shouldCheckIfUserExistsByEmail() {
        // Given
        UserId userId = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user = User.builder()
                .id(userId)
                .password("test-password")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user);

        // When
        boolean exists = userRepository.existsById_Email(TEST_EMAIL);
        boolean notExists = userRepository.existsById_Email("nonexistent@example.com");

        // Then
        assertTrue(exists);
        assertFalse(notExists);
    }

    @Test
    void shouldHandleCompositeKeyUniqueness() {
        // Given
        UserId userId1 = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user1 = User.builder()
                .id(userId1)
                .password("test-password")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user1);

        // When & Then - Should not allow duplicate composite key
        UserId userId2 = new UserId(TEST_EMAIL, UserRole.BUYER);
        User user2 = User.builder()
                .id(userId2)
                .password("different-password")
                .isActive(true)
                .build();

        assertThrows(Exception.class, () -> {
            entityManager.persistAndFlush(user2);
        });
    }

    @Test
    void shouldFindAllUsersWithSameEmail() {
        // Given
        UserId buyerId = new UserId(TEST_EMAIL, UserRole.BUYER);
        UserId sellerId = new UserId(TEST_EMAIL, UserRole.SELLER);
        UserId adminId = new UserId(TEST_EMAIL, UserRole.ADMIN);
        
        User buyer = User.builder().id(buyerId).password("buyer").isActive(true).build();
        User seller = User.builder().id(sellerId).password("seller").isActive(true).build();
        User admin = User.builder().id(adminId).password("admin").isActive(true).build();

        entityManager.persistAndFlush(buyer);
        entityManager.persistAndFlush(seller);
        entityManager.persistAndFlush(admin);

        // When
        List<User> foundUsers = userRepository.findById_Email(TEST_EMAIL);

        // Then
        assertEquals(3, foundUsers.size()); // Should find all 3 users with same email
        assertTrue(foundUsers.stream().allMatch(user -> TEST_EMAIL.equals(user.getEmail())));
    }

    @Test
    void shouldHandleNullEmail() {
        // When
        List<User> foundUsers = userRepository.findById_Email(null);

        // Then
        assertTrue(foundUsers.isEmpty());
    }

    @Test
    void shouldHandleEmptyEmail() {
        // When
        List<User> foundUsers = userRepository.findById_Email("");

        // Then
        assertTrue(foundUsers.isEmpty());
    }

    @Test
    void shouldHandleNullRole() {
        // When
        Optional<User> foundUser = userRepository.findById_EmailAndId_Role(TEST_EMAIL, null);

        // Then
        assertFalse(foundUser.isPresent());
    }
}
