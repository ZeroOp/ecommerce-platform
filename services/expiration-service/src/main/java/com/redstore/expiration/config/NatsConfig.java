package com.redstore.expiration.config;

import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.JetStreamSubscription;
import io.nats.client.Nats;
import io.nats.client.Options;
import io.nats.client.PullSubscribeOptions;
import io.nats.client.api.ConsumerConfiguration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Slf4j
@Configuration
public class NatsConfig {

    @Value("${nats.url}")
    private String natsUrl;
    @Value("${expiration.nats.orders.stream}")
    private String ordersStream;
    @Value("${expiration.nats.orders.durable}")
    private String ordersDurable;
    @Value("${expiration.nats.orders.filter-subject}")
    private String ordersFilterSubject;
    @Value("${expiration.nats.deals.stream}")
    private String dealsStream;
    @Value("${expiration.nats.deals.durable}")
    private String dealsDurable;
    @Value("${expiration.nats.deals.filter-subject}")
    private String dealsFilterSubject;

    @Bean
    public Connection natsConnection() throws IOException, InterruptedException {
        Options options = new Options.Builder()
                .server(natsUrl)
                .connectionName("expiration-service")
                .maxReconnects(-1)
                .build();
        return Nats.connect(options);
    }

    @Bean
    public JetStream jetStream(Connection natsConnection) throws IOException {
        return natsConnection.jetStream();
    }

    @Bean
    public JetStreamSubscription expirationOrderCreatedSubscription(JetStream js) throws Exception {
        return subscribePullWithRetries(js, ordersStream, ordersDurable, ordersFilterSubject, "orders");
    }

    @Bean
    public JetStreamSubscription expirationDealCreatedSubscription(JetStream js) throws Exception {
        return subscribePullWithRetries(js, dealsStream, dealsDurable, dealsFilterSubject, "deals");
    }

    private JetStreamSubscription subscribePullWithRetries(
            JetStream js,
            String stream,
            String durable,
            String filterSubject,
            String label
    ) throws Exception {
        ConsumerConfiguration cc = ConsumerConfiguration.builder()
                .durable(durable)
                .filterSubject(filterSubject)
                .build();
        PullSubscribeOptions opts = PullSubscribeOptions.builder()
                .stream(stream)
                .configuration(cc)
                .build();
        int attempts = 10;
        for (int i = 1; i <= attempts; i++) {
            try {
                log.info("expiration-service: {} pull subscribe (attempt {}) stream={} durable={} subject={}",
                        label, i, stream, durable, filterSubject);
                return js.subscribe(filterSubject, opts);
            } catch (Exception e) {
                if (i == attempts) throw e;
                log.warn("expiration-service: {} subscribe attempt {} failed ({}); retrying", label, i, e.getMessage());
                Thread.sleep(3000L * i);
            }
        }
        throw new IllegalStateException("unreachable");
    }
}
