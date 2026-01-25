package com.company.hr.entity.settings;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "app_settings")
public class AppSetting {

    @Id
    private Long id = 1L;

    @Column(length = 200)
    private String siteName;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(length = 300)
    private String websiteBaseUrl;

    @Column(length = 500)
    private String logoPath;

    // Landing page configurable texts (Master Setting)
    @Column(name = "landing_hero_badge", length = 200)
    private String landingHeroBadge;

    @Column(name = "landing_hero_title", length = 300)
    private String landingHeroTitle;

    @Column(name = "landing_hero_subtitle", length = 1000)
    private String landingHeroSubtitle;

    @Column(name = "landing_status_text", length = 300)
    private String landingStatusText;

    @Column(name = "landing_vision_text", length = 1000)
    private String landingVisionText;

    @Column(name = "landing_mission1", length = 300)
    private String landingMission1;

    @Column(name = "landing_mission2", length = 300)
    private String landingMission2;

    @Column(name = "landing_mission3", length = 300)
    private String landingMission3;

    @Column(name = "landing_footer_text", length = 1000)
    private String landingFooterText;

    @Column(name = "landing_hero_image_path", length = 500)
    private String landingHeroImagePath;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public AppSetting() {
    }

    public Long getId() {
        return id;
    }

    public String getSiteName() {
        return siteName;
    }

    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsiteBaseUrl() {
        return websiteBaseUrl;
    }

    public void setWebsiteBaseUrl(String websiteBaseUrl) {
        this.websiteBaseUrl = websiteBaseUrl;
    }

    public String getLogoPath() {
        return logoPath;
    }

    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }

    public String getLandingHeroBadge() {
        return landingHeroBadge;
    }

    public void setLandingHeroBadge(String landingHeroBadge) {
        this.landingHeroBadge = landingHeroBadge;
    }

    public String getLandingHeroTitle() {
        return landingHeroTitle;
    }

    public void setLandingHeroTitle(String landingHeroTitle) {
        this.landingHeroTitle = landingHeroTitle;
    }

    public String getLandingHeroSubtitle() {
        return landingHeroSubtitle;
    }

    public void setLandingHeroSubtitle(String landingHeroSubtitle) {
        this.landingHeroSubtitle = landingHeroSubtitle;
    }

    public String getLandingStatusText() {
        return landingStatusText;
    }

    public void setLandingStatusText(String landingStatusText) {
        this.landingStatusText = landingStatusText;
    }

    public String getLandingVisionText() {
        return landingVisionText;
    }

    public void setLandingVisionText(String landingVisionText) {
        this.landingVisionText = landingVisionText;
    }

    public String getLandingMission1() {
        return landingMission1;
    }

    public void setLandingMission1(String landingMission1) {
        this.landingMission1 = landingMission1;
    }

    public String getLandingMission2() {
        return landingMission2;
    }

    public void setLandingMission2(String landingMission2) {
        this.landingMission2 = landingMission2;
    }

    public String getLandingMission3() {
        return landingMission3;
    }

    public void setLandingMission3(String landingMission3) {
        this.landingMission3 = landingMission3;
    }

    public String getLandingFooterText() {
        return landingFooterText;
    }

    public void setLandingFooterText(String landingFooterText) {
        this.landingFooterText = landingFooterText;
    }

    public String getLandingHeroImagePath() {
        return landingHeroImagePath;
    }

    public void setLandingHeroImagePath(String landingHeroImagePath) {
        this.landingHeroImagePath = landingHeroImagePath;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

