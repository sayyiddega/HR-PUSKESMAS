package com.company.hr.repository.settings;

import com.company.hr.entity.settings.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingRepository extends JpaRepository<AppSetting, Long> {
}

