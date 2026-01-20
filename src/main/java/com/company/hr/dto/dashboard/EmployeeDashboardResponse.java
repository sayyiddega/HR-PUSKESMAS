package com.company.hr.dto.dashboard;

import com.company.hr.dto.leave.LeaveRequestResponse;

public record EmployeeDashboardResponse(
        // Basic stats
        long employeeId,
        long totalDocumentTypes,
        long uploadedDocuments,
        long mandatoryDocsUploaded,
        long mandatoryDocsMissing,
        long pendingLeaves,
        long approvedLeaves,
        
        // Latest leave request (if any)
        LeaveRequestResponse latestLeaveRequest
) {
}
