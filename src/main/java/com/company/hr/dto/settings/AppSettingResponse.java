package com.company.hr.dto.settings;

import com.company.hr.entity.settings.AppSetting;

import java.time.Instant;

public record AppSettingResponse(
        String siteName,
        String address,
        String phone,
        String websiteBaseUrl,
        String logoPath,
        String logoUrl,
        Instant updatedAt
) {
    public static AppSettingResponse from(AppSetting s, String logoUrl) {
        return new AppSettingResponse(
                s.getSiteName(),
                s.getAddress(),
                s.getPhone(),
                s.getWebsiteBaseUrl(),
                s.getLogoPath(),
                logoUrl,
                s.getUpdatedAt()
        );
    }
}

