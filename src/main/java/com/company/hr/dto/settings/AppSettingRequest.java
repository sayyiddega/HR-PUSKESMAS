package com.company.hr.dto.settings;

import jakarta.validation.constraints.Size;

public record AppSettingRequest(
        @Size(max = 200) String siteName,
        @Size(max = 255) String address,
        @Size(max = 50) String phone,
        @Size(max = 300) String websiteBaseUrl
) {
}

