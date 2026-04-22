package com.redstore.archiver.config;

import io.nats.client.*;
import io.nats.client.api.ConsumerConfiguration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.List;

@Slf4j
@Configuration
public class NatsConfig {
    @Value("${nats.url}")
    private String natsUrl;

    @Bean
    public Connection natsConnection() throws IOException, InterruptedException {
        Options options = new Options.Builder()
                .server(natsUrl)
                .connectionName("archive-service")
                .maxReconnects(-1)
                .build();
        return Nats.connect(options);
    }

    @Bean
    public JetStream jetStream(Connection natsConnection) throws IOException {
        return natsConnection.jetStream();
    }

    @Bean
    public List<JetStreamSubscription> archiverSubscriptions(JetStream js) throws Exception {
        JetStreamSubscription identity = createPullSubscription(js, "IDENTITY", "archiver-identity", "identity.>");
        JetStreamSubscription products = createPullSubscription(js, "PRODUCTS", "archiver-products", "product.>");
        JetStreamSubscription orders = createPullSubscription(js, "ORDERS", "archiver-orders-order", "order.>");
        JetStreamSubscription payments = createPullSubscription(js, "ORDERS", "archiver-orders-payment", "payment.>");
        JetStreamSubscription deals = createPullSubscription(js, "DEALS", "archiver-deals", "deal.>");

        return List.of(identity, products, orders, payments, deals);
    }

    private static final int MAX_RETRIES = 10;
    private static final long RETRY_DELAY_MS = 30000;
    private JetStreamSubscription createPullSubscription(JetStream js, String stream, String durable, String subject) throws Exception {
        ConsumerConfiguration cc = ConsumerConfiguration.builder()
                .durable(durable)
                .filterSubject(subject)
                .build();

        PullSubscribeOptions opts = PullSubscribeOptions.builder()
                .stream(stream)
                .configuration(cc)
                .build();

        for (int attempt =1 ; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.info("Creating pull subscription (attempt {}): stream={}, durable={}, subject={}", attempt, stream,durable, subject);
                return js.subscribe(subject, opts);
            } catch (Exception e) {
                if (attempt == MAX_RETRIES) {
                    log.error("Failed to create subscritpion after {} attempts: stream={}, durable={}, subject={}", MAX_RETRIES, stream,durable, subject);
                    throw e;
                }
                log.warn("Subscription attempt {} failed for stream={}, durable={}, subject={}", attempt, stream,durable, subject);
                Thread.sleep(RETRY_DELAY_MS);
            }
        }
        throw  new IllegalStateException("Unreachable");
    }
}
