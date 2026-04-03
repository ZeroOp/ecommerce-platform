package com.redstore.common.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;

@Getter
public abstract class BaseException extends RuntimeException {
    private final HttpStatus statusCode;

    public BaseException(String message, HttpStatus statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    // This mimics your serializeErrors() method
    public abstract List<Map<String, String>> serializeErrors();
}