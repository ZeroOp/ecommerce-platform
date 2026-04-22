package com.redstore.payment.config;

import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Nats;
import io.nats.client.Options;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class NatsConfig {

    @Value("${nats.url}")
    private String natsUrl;

    @Bean
    public Connection natsConnection() throws IOException, InterruptedException {
        Options options = new Options.Builder()
                .server(natsUrl)
                .connectionName("payment-service")
                .maxReconnects(-1)
                .build();
        return Nats.connect(options);
    }

    @Bean
    public JetStream jetStream(Connection natsConnection) throws IOException {
        return natsConnection.jetStream();
    }
}
