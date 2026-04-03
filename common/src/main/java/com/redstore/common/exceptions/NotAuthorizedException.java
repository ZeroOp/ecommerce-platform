package com.redstore.common.exceptions;

import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;

public class NotAuthorizedException extends BaseException {
    public NotAuthorizedException() {
        super("Not Authorized", HttpStatus.UNAUTHORIZED);
    }

    @Override
    public List<Map<String, String>> serializeErrors() {
        return List.of(Map.of("message", "Not Authorized"));
    }
}