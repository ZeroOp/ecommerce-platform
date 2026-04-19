package com.redstore.expiration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Tiny service whose only job is to emit delayed fire-once events.
 *
 * <p>Listens for:</p>
 * <ul>
 *   <li>{@code order.created} — schedules an {@code order.expired} event
 *       for {@code expiresAt};</li>
 *   <li>{@code deal.created} — schedules a {@code deal.expired} event
 *       for the seller-chosen expiry.</li>
 * </ul>
 *
 * <p>Backed by a single Postgres table ({@code expiration_jobs}) and a
 * scheduled poller. See {@code scheduler.ExpirationScheduler}.</p>
 */
@SpringBootApplication
@EnableScheduling
public class ExpirationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpirationApplication.class, args);
    }
}
