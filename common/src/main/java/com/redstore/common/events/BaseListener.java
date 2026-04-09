package com.redstore.common.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.common.enums.Subjects;
import io.nats.client.*;
import io.nats.client.api.AckPolicy;
import io.nats.client.api.ConsumerConfiguration;
import io.nats.client.api.DeliverPolicy;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

@Slf4j
public abstract class BaseListener<T> {
    protected abstract Subjects getSubject();
    protected abstract String getQueueGroupName();
    protected abstract void onMessage(T data, Message msg);

    private final Connection natsConnection;
    private final JetStream js;
    private final Class<T> targetType;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * @param natsConnection The core NATS connection required to create a Dispatcher
     * @param js The JetStream context for streaming capabilities
     * @param targetType The class type for JSON deserialization (e.g., UserCreatedEvent.class)
     */
    public BaseListener(Connection natsConnection, JetStream js, Class<T> targetType) {
        this.natsConnection = natsConnection;
        this.js = js;
        this.targetType = targetType;
    }

    @PostConstruct
    public void listen() throws Exception {
        // 1. Configure the Consumer (matches your STAN subscriptionOptions logic)
        ConsumerConfiguration config = ConsumerConfiguration.builder()
                .ackPolicy(AckPolicy.Explicit)        // Manual Ack Mode
                .deliverPolicy(DeliverPolicy.All)     // Deliver All Available
                .ackWait(Duration.ofSeconds(5))       // 5 seconds ack wait
                .durable(getQueueGroupName())         // Set Durable Name
                .build();

        // 2. Configure Subscribe Options
        PushSubscribeOptions options = PushSubscribeOptions.builder()
                .configuration(config)
                .deliverGroup(getQueueGroupName())    // The Queue Group name
                .build();

        // 3. Create a Dispatcher to handle the message callback thread
        Dispatcher dispatcher = natsConnection.createDispatcher((msg) -> {
            // This is effectively the "subscription.on('message')" logic
            try {
                log.info("Message received: {} / {}", getSubject().getValue(), getQueueGroupName());
                T parsedData = objectMapper.readValue(msg.getData(), targetType);
                onMessage(parsedData, msg);
            } catch (Exception e) {
                log.error("Error processing NATS message: ", e);
            }
        });

        /*
         * 4. Subscribe to the JetStream
         * We use the signature: subscribe(subject, queue, dispatcher, handler, autoAck, options)
         * - subject: The NATS subject (e.g., auth.user.created)
         * - queue: The queue group name for load balancing
         * - dispatcher: The dispatcher created above
         * - handler: Passing a dummy handler because logic is already inside the dispatcher
         * - autoAck: false (We want to call msg.ack() manually in our services)
         * - options: The PushSubscribeOptions containing our Durable and DeliverPolicy
         */
        js.subscribe(
                getSubject().getValue(),
                getQueueGroupName(),
                dispatcher,
                msg -> {},
                false,
                options
        );

        log.info("Successfully initialized listener for subject: {}", getSubject().getValue());
    }
}