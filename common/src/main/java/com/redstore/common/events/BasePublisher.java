package com.redstore.common.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.redstore.common.enums.Subjects;
import io.nats.client.JetStream;
import io.nats.client.Message;
import io.nats.client.impl.NatsMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class BasePublisher<T> {
    private final JetStream js;
    protected abstract Subjects getSubject();
    private final ObjectMapper objectMapper;

    public BasePublisher(JetStream js) {
        this.js = js;
        this.objectMapper = new ObjectMapper();
        // Add JSR310 module for LocalDateTime support
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public void publish(T data) {
        try {
            byte[] body = objectMapper.writeValueAsBytes(data);

            Message msg = NatsMessage.builder()
                    .subject(getSubject().getValue())
                    .data(body)
                    .build();

            js.publish(msg);
            log.info("[EVENT PUBLISHED]: {}", getSubject().getValue());
        } catch (Exception e) {
            log.error("Failed to publish event to NATS", e);
            throw new RuntimeException(e);
        }
    }
}