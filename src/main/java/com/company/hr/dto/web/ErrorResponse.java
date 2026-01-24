package com.company.hr.dto.web;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        String error,
        String message,
        Instant timestamp,
        String path,
        Map<String, Object> details
) {
    public static ErrorResponse of(String error, String message, String path) {
        return new ErrorResponse(error, message, Instant.now(), path, null);
    }

    public static ErrorResponse of(String error, String message, String path, Map<String, Object> details) {
        return new ErrorResponse(error, message, Instant.now(), path, details);
    }
}
