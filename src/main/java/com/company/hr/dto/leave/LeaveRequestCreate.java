package com.company.hr.dto.leave;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LeaveRequestCreate(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank String reason
) {
}

