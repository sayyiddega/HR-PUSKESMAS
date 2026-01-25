import { apiClient } from './client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apitny.uctech.online/api';

export interface AppSettings {
  id?: number;
  siteName?: string;
  address?: string;
  phone?: string;
  websiteBaseUrl?: string;
  logoUrl?: string;
  landingHeroImageUrl?: string;

  // Landing page configurable texts
  landingHeroBadge?: string;
  landingHeroTitle?: string;
  landingHeroSubtitle?: string;
  landingStatusText?: string;
  landingVisionText?: string;
  landingMission1?: string;
  landingMission2?: string;
  landingMission3?: string;
  landingFooterText?: string;
}

export interface AppSettingsRequest {
  siteName?: string;
  address?: string;
  phone?: string;
  websiteBaseUrl?: string;

  // Landing page texts (optional)
  landingHeroBadge?: string;
  landingHeroTitle?: string;
  landingHeroSubtitle?: string;
  landingStatusText?: string;
  landingVisionText?: string;
  landingMission1?: string;
  landingMission2?: string;
  landingMission3?: string;
  landingFooterText?: string;
}

/** GET settings tanpa token — untuk landing, login, favicon/title. */
export async function getPublicSettings(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE_URL}/public/settings`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(res.status === 401 ? 'Unauthorized' : `Error ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  if (json && typeof json === 'object' && !Array.isArray(json) && 'data' in json) {
    return json.data as AppSettings;
  }
  return json as AppSettings;
}

export const settingsApi = {
  get: async (): Promise<AppSettings> => {
    return apiClient.get<AppSettings>('/admin/settings');
  },

  getPublic: getPublicSettings,

  update: async (data: AppSettingsRequest): Promise<AppSettings> => {
    return apiClient.put<AppSettings>('/admin/settings', data);
  },

  uploadLogo: async (file: File): Promise<AppSettings> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<AppSettings>('/admin/settings/logo', formData);
  },

  uploadLandingImage: async (file: File): Promise<AppSettings> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<AppSettings>('/admin/settings/landing-image', formData);
  },
};
