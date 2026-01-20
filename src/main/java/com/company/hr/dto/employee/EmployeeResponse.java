package com.company.hr.dto.employee;

import com.company.hr.entity.employee.Employee;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String email,
        String fullName,
        String position,
        String department,
        String phone,
        String address,
        LocalDate dateOfBirth,
        LocalDate joinDate,
        String profilePhotoPath,
        String profilePhotoUrl
) {
    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getUserAccount() != null ? e.getUserAccount().getEmail() : null,
                e.getFullName(),
                e.getPosition(),
                e.getDepartment(),
                e.getPhone(),
                e.getAddress(),
                e.getDateOfBirth(),
                e.getJoinDate(),
                e.getProfilePhotoPath(),
                null // URL will be set by controller
        );
    }

    public static EmployeeResponse from(Employee e, String profilePhotoUrl) {
        return new EmployeeResponse(
                e.getId(),
                e.getUserAccount() != null ? e.getUserAccount().getEmail() : null,
                e.getFullName(),
                e.getPosition(),
                e.getDepartment(),
                e.getPhone(),
                e.getAddress(),
                e.getDateOfBirth(),
                e.getJoinDate(),
                e.getProfilePhotoPath(),
                profilePhotoUrl
        );
    }
}

