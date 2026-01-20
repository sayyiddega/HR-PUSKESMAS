package com.company.hr.service.settings;

import com.company.hr.dto.settings.AppSettingRequest;
import com.company.hr.entity.settings.AppSetting;
import com.company.hr.repository.settings.AppSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@SuppressWarnings("null")
public class AppSettingService {

    public static final long SINGLETON_ID = 1L;

    private final AppSettingRepository repository;

    public AppSettingService(AppSettingRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public AppSetting getOrCreate() {
        return repository.findById(SINGLETON_ID).orElseGet(() -> {
            AppSetting s = new AppSetting();
            return Objects.requireNonNull(repository.save(s), "Failed to create settings");
        });
    }

    @Transactional
    public AppSetting update(AppSettingRequest req) {
        AppSetting s = getOrCreate();
        if (req.siteName() != null) s.setSiteName(req.siteName());
        if (req.address() != null) s.setAddress(req.address());
        if (req.phone() != null) s.setPhone(req.phone());
        if (req.websiteBaseUrl() != null) s.setWebsiteBaseUrl(trimTrailingSlash(req.websiteBaseUrl()));
        return Objects.requireNonNull(repository.save(s), "Failed to update settings");
    }

    @Transactional
    public AppSetting updateLogoPath(String logoPath) {
        AppSetting s = getOrCreate();
        s.setLogoPath(logoPath);
        return Objects.requireNonNull(repository.save(s), "Failed to update settings logo");
    }

    private String trimTrailingSlash(String url) {
        if (url == null) return null;
        String t = url.trim();
        while (t.endsWith("/")) t = t.substring(0, t.length() - 1);
        return t;
    }
}

