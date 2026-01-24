package com.company.hr.dto.leave;

import com.company.hr.entity.leave.LeaveRequest;
import com.company.hr.entity.leave.LeaveStatus;

import java.time.Instant;
import java.time.LocalDate;

public record LeaveRequestResponse(
        Long id,
        Long employeeId,
        String employeeName,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        LeaveStatus status,
        String attachmentPath,
        String attachmentUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static LeaveRequestResponse from(LeaveRequest lr, String attachmentUrl) {
        return new LeaveRequestResponse(
                lr.getId(),
                lr.getEmployee().getId(),
                lr.getEmployee().getFullName(),
                lr.getStartDate(),
                lr.getEndDate(),
                lr.getReason(),
                lr.getStatus(),
                lr.getAttachmentPath(),
                attachmentUrl,
                lr.getCreatedAt(),
                lr.getUpdatedAt()
        );
    }
}

