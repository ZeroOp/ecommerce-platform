package com.redstore.common.exceptions;

import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;

public class ForbiddenException extends BaseException {
    private final String message;

    public ForbiddenException(String message) {
        super("Access Denied", HttpStatus.FORBIDDEN);
        this.message = message;
    }

    @Override
    public List<Map<String, String>> serializeErrors() {
        return List.of(Map.of("message", message));
    }
}
