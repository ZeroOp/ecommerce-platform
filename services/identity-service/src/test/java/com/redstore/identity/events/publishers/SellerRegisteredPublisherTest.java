package com.redstore.identity.events.publishers;

import com.redstore.common.dto.SellerRegisteredEventData;
import com.redstore.identity.TestConfig;
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

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
})
@ActiveProfiles("test")
@Import(TestConfig.class)
class SellerRegisteredPublisherTest {

    @Autowired
    private SellerRegisteredPublisher sellerRegisteredPublisher;

    @MockBean
    private JetStream jetStream;

    @MockBean
    private Connection natsConnection;

    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @BeforeEach
    void setUp() {
        // Setup mock Redis ValueOperations
        ValueOperations<String, String> valueOperations = Mockito.mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void shouldCreatePublisherWithJetStream() {
        // When
        SellerRegisteredPublisher publisher = new SellerRegisteredPublisher(jetStream);

        // Then
        assertNotNull(publisher);
    }

    @Test
    void shouldReturnCorrectSubject() {
        // When
        var subject = sellerRegisteredPublisher.getSubject();

        // Then
        assertNotNull(subject);
        assertEquals("identity.seller.registered", subject.getValue());
    }

    @Test
    void shouldPublishSellerRegisteredEvent() {
        // Given
        SellerRegisteredEventData eventData = SellerRegisteredEventData.builder()
                .userId("test-user-id")
                .email("seller@example.com")
                .businessName("Test Business")
                .role(com.redstore.common.enums.UserRole.SELLER)
                .registrationTime(LocalDateTime.now())
                .registrationSource("google")
                .isFirstTimeRegistration(true)
                .build();

        // When & Then - Should not throw exception
        assertDoesNotThrow(() -> {
            sellerRegisteredPublisher.publish(eventData);
        });
    }

    @Test
    void shouldHandleNullEventData() {
        // When & Then - Should handle null gracefully
        assertDoesNotThrow(() -> {
            sellerRegisteredPublisher.publish(null);
        });
    }

    @Test
    void shouldHandleEventDataWithNullFields() {
        // Given
        SellerRegisteredEventData eventData = SellerRegisteredEventData.builder()
                .userId(null)
                .email(null)
                .businessName(null)
                .role(null)
                .registrationTime(null)
                .registrationSource(null)
                .isFirstTimeRegistration(false)
                .build();

        // When & Then - Should handle null fields gracefully
        assertDoesNotThrow(() -> {
            sellerRegisteredPublisher.publish(eventData);
        });
    }

    @Test
    void shouldHandleEventDataWithEmptyStrings() {
        // Given
        SellerRegisteredEventData eventData = SellerRegisteredEventData.builder()
                .userId("")
                .email("")
                .businessName("")
                .role(com.redstore.common.enums.UserRole.SELLER)
                .registrationTime(LocalDateTime.now())
                .registrationSource("")
                .isFirstTimeRegistration(false)
                .build();

        // When & Then - Should handle empty strings gracefully
        assertDoesNotThrow(() -> {
            sellerRegisteredPublisher.publish(eventData);
        });
    }

    @Test
    void shouldHandleMultipleEvents() {
        // Given
        SellerRegisteredEventData eventData1 = SellerRegisteredEventData.builder()
                .userId("user-1")
                .email("seller1@example.com")
                .businessName("Business 1")
                .role(com.redstore.common.enums.UserRole.SELLER)
                .registrationTime(LocalDateTime.now())
                .registrationSource("google")
                .isFirstTimeRegistration(true)
                .build();

        SellerRegisteredEventData eventData2 = SellerRegisteredEventData.builder()
                .userId("user-2")
                .email("seller2@example.com")
                .businessName("Business 2")
                .role(com.redstore.common.enums.UserRole.SELLER)
                .registrationTime(LocalDateTime.now())
                .registrationSource("email")
                .isFirstTimeRegistration(false)
                .build();

        // When & Then - Should publish multiple events without issues
        assertDoesNotThrow(() -> {
            sellerRegisteredPublisher.publish(eventData1);
            sellerRegisteredPublisher.publish(eventData2);
        });
    }

    @Test
    void shouldHandleEventDataWithAllFields() {
        // Given
        SellerRegisteredEventData eventData = SellerRegisteredEventData.builder()
                .userId("test-user-id")
                .email("seller@example.com")
                .businessName("Complete Business")
                .role(com.redstore.common.enums.UserRole.SELLER)
                .registrationTime(LocalDateTime.now())
                .registrationSource("google")
                .isFirstTimeRegistration(true)
                .businessType("Retail")
                .businessDescription("A complete business description")
                .phone("+1234567890")
                .build();

        // When & Then - Should handle complete event data
        assertDoesNotThrow(() -> {
            sellerRegisteredPublisher.publish(eventData);
        });
    }
}
