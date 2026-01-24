package com.company.hr.dto.document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DocumentTypeRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 500) String description,
        boolean mandatory
) {
}

