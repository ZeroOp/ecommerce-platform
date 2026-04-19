package com.redstore.expiration.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * One row per pending fire-once timer.
 *
 * <p>{@code payloadJson} stores the event body we'll publish when the job
 * fires — keeping it as JSON lets the listeners enrich it with whatever
 * the downstream consumers need (sellerId, scope, etc.) without growing
 * this table schema every time a new field is added upstream.</p>
 *
 * <p>Uniqueness on {@code (type, entity_id)} guarantees redelivery of a
 * {@code .created} event doesn't create duplicate timers — the listener
 * just does an idempotent upsert.</p>
 */
@Entity
@Table(
        name = "expiration_jobs",
        indexes = {
                @Index(name = "idx_expiration_fire_at", columnList = "fire_at"),
                @Index(name = "idx_expiration_fired", columnList = "fired"),
                @Index(name = "idx_expiration_type_entity", columnList = "type, entity_id", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpirationJob {

    @Id
    @Column(length = 80)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ExpirationType type;

    /** Business id of the thing being expired (orderId / dealId). */
    @Column(name = "entity_id", nullable = false, length = 80)
    private String entityId;

    /** When this job should fire. */
    @Column(name = "fire_at", nullable = false)
    private Instant fireAt;

    /** Marks the row as drained once the emit succeeds. Never deleted — useful audit trail. */
    @Column(nullable = false)
    private boolean fired;

    @Column(name = "fired_at")
    private Instant firedAt;

    /** JSON blob representing the event payload we publish when firing. */
    @Column(name = "payload_json", nullable = false, columnDefinition = "text")
    private String payloadJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
