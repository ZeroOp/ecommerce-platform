package com.redstore.common.utils;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole; // CRITICAL: Import the Enum
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class UserContextTest {

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void shouldStoreAndRetrieveUser() {
        // FIX: Changed Set.of("USER") to Set.of(UserRole.BUYER)
        UserPayload payload = UserPayload.builder()
                .id("123")
                .email("test@redstore.com")
                .roles(Set.of(UserRole.BUYER))
                .build();

        UserContext.setUser(payload);

        assertEquals(payload, UserContext.getUser());
        assertEquals("test@redstore.com", UserContext.getUser().getEmail());
    }

    @Test
    void shouldClearUser() {
        // FIX: Added the mandatory roles field using the Enum
        UserContext.setUser(UserPayload.builder()
                .id("123")
                .roles(Set.of(UserRole.BUYER))
                .build());

        UserContext.clear();
        assertNull(UserContext.getUser());
    }
}