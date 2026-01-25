package com.company.hr.controller.settings;

import com.company.hr.dto.settings.AppSettingRequest;
import com.company.hr.dto.settings.AppSettingResponse;
import com.company.hr.service.settings.AppSettingService;
import com.company.hr.service.settings.UrlBuilder;
import com.company.hr.service.storage.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/settings")
@Tag(name = "Admin - Settings")
public class AdminSettingController {

    private final AppSettingService settingService;
    private final StorageService storageService;
    private final UrlBuilder urlBuilder;

    public AdminSettingController(AppSettingService settingService, StorageService storageService, UrlBuilder urlBuilder) {
        this.settingService = settingService;
        this.storageService = storageService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping
    @Operation(summary = "Get application settings")
    public AppSettingResponse get() {
        var s = settingService.getOrCreate();
        return AppSettingResponse.from(s, urlBuilder.fileUrl(s.getLogoPath()), urlBuilder.fileUrl(s.getLandingHeroImagePath()));
    }

    @PutMapping
    @Operation(summary = "Update application settings (text fields)")
    public AppSettingResponse update(@Valid @RequestBody AppSettingRequest req) {
        var s = settingService.update(req);
        return AppSettingResponse.from(s, urlBuilder.fileUrl(s.getLogoPath()), urlBuilder.fileUrl(s.getLandingHeroImagePath()));
    }

    @PostMapping("/logo")
    @Operation(summary = "Upload/update logo (png/jpg)")
    public ResponseEntity<AppSettingResponse> uploadLogo(@RequestParam("file") MultipartFile file) {
        String original = file.getOriginalFilename();
        String name = original == null ? "" : original.toLowerCase();
        if (!(name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg"))) {
            throw new IllegalArgumentException("Only png, jpg, jpeg allowed for logo");
        }
        String path = storageService.storeLogo(file);
        var s = settingService.updateLogoPath(path);
        return ResponseEntity.status(HttpStatus.CREATED).body(AppSettingResponse.from(s, urlBuilder.fileUrl(s.getLogoPath()), urlBuilder.fileUrl(s.getLandingHeroImagePath())));
    }

    @PostMapping("/landing-image")
    @Operation(summary = "Upload/update gambar hero landing page (png/jpg)")
    public ResponseEntity<AppSettingResponse> uploadLandingImage(@RequestParam("file") MultipartFile file) {
        String original = file.getOriginalFilename();
        String name = original == null ? "" : original.toLowerCase();
        if (!(name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg"))) {
            throw new IllegalArgumentException("Only png, jpg, jpeg allowed for landing image");
        }
        String path = storageService.storeLandingImage(file);
        var s = settingService.updateLandingImagePath(path);
        return ResponseEntity.status(HttpStatus.CREATED).body(AppSettingResponse.from(s, urlBuilder.fileUrl(s.getLogoPath()), urlBuilder.fileUrl(s.getLandingHeroImagePath())));
    }
}

