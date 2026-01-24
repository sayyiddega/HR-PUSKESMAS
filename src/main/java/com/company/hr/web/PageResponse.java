package com.company.hr.web;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic wrapper untuk response pagination REST API.
 * page di-expose sebagai 1-based index agar lebih natural di sisi frontend.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}

