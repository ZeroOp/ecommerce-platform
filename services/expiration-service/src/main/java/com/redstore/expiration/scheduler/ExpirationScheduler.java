package com.redstore.expiration.scheduler;

import com.redstore.expiration.service.ExpirationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * The timer-drainer. Runs on a fixed-delay loop (not fixed-rate — we never
 * want overlapping sweeps); every tick pulls up to {@code max-batch} jobs
 * whose {@code fireAt} has elapsed and fires their events.
 *
 * <p>Fixed-delay + row-level locks in the repo give us at-least-once
 * behaviour even across replicas or restarts. Downstream consumers are
 * already idempotent (order.expired and deal.expired are safe to replay).</p>
 */
@Component
@Slf4j
public class ExpirationScheduler {

    private final ExpirationService expirationService;

    @Value("${expiration.max-batch}")
    private int maxBatch;

    public ExpirationScheduler(ExpirationService expirationService) {
        this.expirationService = expirationService;
    }

    @Scheduled(fixedDelayString = "${expiration.sweep-interval-ms}")
    public void sweep() {
        try {
            int fired = expirationService.sweepDue(Instant.now(), maxBatch);
            if (fired > 0) {
                log.info("Expiration sweep fired {} jobs", fired);
            }
        } catch (Exception e) {
            log.error("Expiration sweep failed", e);
        }
    }
}
