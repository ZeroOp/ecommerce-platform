package com.redstore.analytics.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class ClickHouseClient {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String endpoint;
    private final String database;
    private final String authHeader;

    public ClickHouseClient(
            @Value("${analytics.clickhouse.endpoint}") String endpoint,
            @Value("${analytics.clickhouse.database}") String database,
            @Value("${analytics.clickhouse.username}") String username,
            @Value("${analytics.clickhouse.password}") String password
    ) {
        this.endpoint = endpoint;
        this.database = database;
        String token = Base64.getEncoder()
                .encodeToString((username + ":" + (password == null ? "" : password)).getBytes(StandardCharsets.UTF_8));
        this.authHeader = "Basic " + token;
    }

    public String execute(String sql) {
        return request(sql, true);
    }

    public String executeWithoutDatabase(String sql) {
        return request(sql, false);
    }

    public String query(String sql) {
        return request(sql, true);
    }

    private String request(String sql, boolean includeDatabase) {
        try {
            String encoded = URLEncoder.encode(sql, StandardCharsets.UTF_8);
            String base = endpoint + "/?query=" + encoded;
            String url = includeDatabase
                    ? endpoint + "/?database=" + URLEncoder.encode(database, StandardCharsets.UTF_8) + "&query=" + encoded
                    : base;
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .header("Authorization", authHeader)
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();
            HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("ClickHouse query failed (" + response.statusCode() + "): " + response.body());
            }
            return response.body();
        } catch (IOException | InterruptedException e) {
            throw new IllegalStateException("ClickHouse request failed", e);
        }
    }
}
