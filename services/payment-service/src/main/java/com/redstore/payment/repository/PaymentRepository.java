package com.redstore.payment.repository;

import com.redstore.payment.entity.PaymentRecord;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class PaymentRepository {
    private final ConcurrentHashMap<String, PaymentRecord> byOrderId = new ConcurrentHashMap<>();

    public Optional<PaymentRecord> findByOrderId(String orderId) {
        return Optional.ofNullable(byOrderId.get(orderId));
    }

    public PaymentRecord save(PaymentRecord record) {
        byOrderId.put(record.getOrderId(), record);
        return record;
    }
}
