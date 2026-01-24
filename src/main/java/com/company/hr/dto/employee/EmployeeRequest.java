package com.company.hr.dto.employee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 120) String position,
        @Size(max = 120) String department,
        @Size(max = 50) String phone,
        @Size(max = 255) String address,
        LocalDate dateOfBirth,
        LocalDate joinDate,

        // Enriched biodata (optional)
        @Size(max = 30) String nip,
        @Size(max = 30) String nik,
        @Size(max = 10) String gender,
        @Size(max = 100) String placeOfBirth,
        @Size(max = 30) String maritalStatus,
        @Size(max = 30) String religion,
        @Size(max = 100) String lastEducation,
        @Size(max = 30) String rankGolongan,
        @Size(max = 30) String employmentStatus,

        // Remaining leave days (admin-only, diabaikan untuk update self)
        Integer remainingLeaveDays
) {
}

