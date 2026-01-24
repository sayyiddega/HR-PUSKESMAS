package com.company.hr.dto.dashboard;

import java.util.Map;

public record AdminDashboardResponse(
        // Basic stats
        long totalEmployees,
        long totalDocumentTypes,
        long uploadedDocuments,
        long pendingLeaves,
        long approvedLeaves,
        long rejectedLeaves,
        
        // Document completion stats
        long employeesWithCompleteDocs,
        long employeesWithIncompleteDocs,
        
        // Position distribution
        Map<String, Long> positionDistribution,
        
        // Documents need review (employees missing mandatory docs)
        long documentsNeedReview
) {
}
