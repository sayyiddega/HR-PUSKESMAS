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
        Instant updatedAt,

        // Landing page configurable texts
        String landingHeroBadge,
        String landingHeroTitle,
        String landingHeroSubtitle,
        String landingStatusText,
        String landingVisionText,
        String landingMission1,
        String landingMission2,
        String landingMission3,
        String landingFooterText
) {
    public static AppSettingResponse from(AppSetting s, String logoUrl) {
        return new AppSettingResponse(
                s.getSiteName(),
                s.getAddress(),
                s.getPhone(),
                s.getWebsiteBaseUrl(),
                s.getLogoPath(),
                logoUrl,
                s.getUpdatedAt(),
                s.getLandingHeroBadge(),
                s.getLandingHeroTitle(),
                s.getLandingHeroSubtitle(),
                s.getLandingStatusText(),
                s.getLandingVisionText(),
                s.getLandingMission1(),
                s.getLandingMission2(),
                s.getLandingMission3(),
                s.getLandingFooterText()
        );
    }
}

