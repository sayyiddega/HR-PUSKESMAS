package com.company.hr.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record InternalMessageRequest(
        @NotEmpty(message = "Receiver IDs are required")
        List<Long> receiverIds,
        
        @NotBlank(message = "Subject is required")
        @Size(max = 500, message = "Subject must not exceed 500 characters")
        String subject,
        
        @NotBlank(message = "Body is required")
        @Size(max = 10000, message = "Body must not exceed 10000 characters")
        String body,

        Long replyToId
) {
}
