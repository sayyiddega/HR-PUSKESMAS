package com.company.hr.dto.document;

import com.company.hr.entity.document.EmployeeDocument;

import java.time.Instant;

public record EmployeeDocumentResponse(
        Long id,
        Long documentTypeId,
        String documentTypeName,
        String originalFilename,
        String storedPath,
        String fileUrl,
        String contentType,
        long size,
        Instant uploadedAt
) {
    public static EmployeeDocumentResponse from(EmployeeDocument d, String fileUrl) {
        return new EmployeeDocumentResponse(
                d.getId(),
                d.getDocumentType().getId(),
                d.getDocumentType().getName(),
                d.getOriginalFilename(),
                d.getStoredPath(),
                fileUrl,
                d.getContentType(),
                d.getSize(),
                d.getUploadedAt()
        );
    }
}

