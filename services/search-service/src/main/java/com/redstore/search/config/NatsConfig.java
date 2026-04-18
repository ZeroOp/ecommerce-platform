package com.redstore.search.config;

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

    @Value("${search.nats.stream}")
    private String stream;

    @Value("${search.nats.durable}")
    private String durable;

    @Value("${search.nats.filter-subject}")
    private String filterSubject;

    @Bean
    public Connection natsConnection() throws IOException, InterruptedException {
        Options options = new Options.Builder()
                .server(natsUrl)
                .connectionName("search-service")
                .maxReconnects(-1)
                .build();
        return Nats.connect(options);
    }

    @Bean
    public JetStream jetStream(Connection natsConnection) throws IOException {
        return natsConnection.jetStream();
    }

    /**
     * Single pull subscription against the existing PRODUCTS stream with our
     * own durable — completely independent of archive-service's durable so
     * both services receive every message.
     */
    @Bean
    public JetStreamSubscription productEventsSubscription(JetStream js) throws Exception {
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
                log.info("search-service: subscribing (attempt {}) stream={} durable={} subject={}",
                        i, stream, durable, filterSubject);
                return js.subscribe(filterSubject, opts);
            } catch (Exception e) {
                if (i == attempts) {
                    throw e;
                }
                log.warn("search-service: subscribe attempt {} failed ({}); retrying", i, e.getMessage());
                Thread.sleep(3000L * i);
            }
        }
        throw new IllegalStateException("unreachable");
    }
}
