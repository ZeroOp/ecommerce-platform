package com.redstore.expiration.repository;

import com.redstore.expiration.entity.ExpirationJob;
import com.redstore.expiration.entity.ExpirationType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ExpirationJobRepository extends JpaRepository<ExpirationJob, String> {

    /** Idempotency guard for listener upserts — one job per (type, entity). */
    Optional<ExpirationJob> findByTypeAndEntityId(ExpirationType type, String entityId);

    /**
     * Pull a batch of not-yet-fired jobs due at or before {@code now}. We
     * lock the rows with {@code SKIP LOCKED} so multiple service replicas
     * can sweep in parallel without stepping on each other.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2"))
    @Query("""
            select j from ExpirationJob j
            where j.fired = false
              and j.fireAt <= :now
            order by j.fireAt asc
            """)
    List<ExpirationJob> findDueForFire(@Param("now") Instant now, Pageable pageable);
}
