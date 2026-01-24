package com.company.hr.dto.document;

import com.company.hr.entity.document.DocumentType;

public record DocumentTypeResponse(
        Long id,
        String name,
        String description,
        boolean mandatory
) {
    public static DocumentTypeResponse from(DocumentType d) {
        return new DocumentTypeResponse(d.getId(), d.getName(), d.getDescription(), d.isMandatory());
    }
}

