package com.company.hr.service.settings;

import com.company.hr.entity.settings.AppSetting;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class UrlBuilder {

    private final AppSettingService settingService;
    private final String serverPort;

    public UrlBuilder(AppSettingService settingService,
                     @Value("${server.port:8080}") String serverPort) {
        this.settingService = settingService;
        this.serverPort = serverPort;
    }

    public String fileUrl(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) return null;
        
        AppSetting s = settingService.getOrCreate();
        String base = s.getWebsiteBaseUrl();
        
        // Fallback ke localhost jika baseUrl belum di-set
        if (base == null || base.isBlank()) {
            base = "http://localhost:" + serverPort;
        }
        
        // Pastikan base URL tidak berakhiran slash
        base = base.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        
        String encoded = encodePath(storedPath);
        return base + "/files/" + encoded;
    }

    private String encodePath(String path) {
        // encode per segment supaya "/" tetap
        String[] parts = path.replace("\\", "/").split("/");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) sb.append("/");
            sb.append(URLEncoder.encode(parts[i], StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}

