package com.company.hr.dto.document;

import java.util.List;

public record EmployeeDocumentGroupResponse(
        Long employeeId,
        String employeeName,
        String employeeEmail,
        List<EmployeeDocumentResponse> documents
) {
}

