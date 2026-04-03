package com.redstore.common.exceptions;

import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;

public class BadRequestException extends BaseException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }

    @Override
    public List<Map<String, String>> serializeErrors() {
        return List.of(Map.of("message", getMessage()));
    }
}