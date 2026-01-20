package com.company.hr.dto.document;

import java.util.List;

public record EmployeeDocumentListResponse(
        List<EmployeeDocumentResponse> documents,
        List<DocumentTypeResponse> missingMandatory
) {
}

