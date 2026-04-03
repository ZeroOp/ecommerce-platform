package com.redstore.common.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<?> handleBaseException(BaseException ex) {
        return new ResponseEntity<>(Map.of("errors", ex.serializeErrors()), ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errorList = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> Map.of(
                        // Use Optional to provide a fallback string if the message is null
                        "message", Optional.ofNullable(error.getDefaultMessage()).orElse("Invalid value"),
                        "field", error.getField()
                ))
                .toList(); // Modern Java 16+ way to collect to an unmodifiable list

        return ResponseEntity.badRequest().body(Map.of("errors", errorList));
    }
}