package com.company.hr.dto.employee;

import com.company.hr.entity.auth.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EmployeeCreateRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotNull Role role,
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 120) String position,
        @Size(max = 120) String department,
        @Size(max = 50) String phone,
        @Size(max = 255) String address,
        LocalDate dateOfBirth,
        LocalDate joinDate
) {
}

