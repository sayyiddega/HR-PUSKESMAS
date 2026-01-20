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
        LocalDate joinDate
) {
}

