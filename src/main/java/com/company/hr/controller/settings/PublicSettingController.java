package com.company.hr.controller.settings;

import com.company.hr.dto.settings.AppSettingResponse;
import com.company.hr.service.settings.AppSettingService;
import com.company.hr.service.settings.UrlBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public endpoint untuk view Master Setting (nama web, logo, dll).
 * Tidak memerlukan token — dipakai di landing, login, dan favicon/title.
 */
@RestController
@RequestMapping("/api/public/settings")
@Tag(name = "Public - Settings")
public class PublicSettingController {

    private final AppSettingService settingService;
    private final UrlBuilder urlBuilder;

    public PublicSettingController(AppSettingService settingService, UrlBuilder urlBuilder) {
        this.settingService = settingService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping
    @Operation(summary = "Get application settings (public, no auth)")
    public AppSettingResponse get() {
        var s = settingService.getOrCreate();
        return AppSettingResponse.from(s, urlBuilder.fileUrl(s.getLogoPath()));
    }
}
