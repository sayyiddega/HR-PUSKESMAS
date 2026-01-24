package com.company.hr.dto.settings;

import jakarta.validation.constraints.Size;

public record AppSettingRequest(
        @Size(max = 200) String siteName,
        @Size(max = 255) String address,
        @Size(max = 50) String phone,
        @Size(max = 300) String websiteBaseUrl,

        // Landing page configurable texts
        @Size(max = 200) String landingHeroBadge,
        @Size(max = 300) String landingHeroTitle,
        @Size(max = 1000) String landingHeroSubtitle,
        @Size(max = 300) String landingStatusText,
        @Size(max = 1000) String landingVisionText,
        @Size(max = 300) String landingMission1,
        @Size(max = 300) String landingMission2,
        @Size(max = 300) String landingMission3,
        @Size(max = 1000) String landingFooterText
) {
}

