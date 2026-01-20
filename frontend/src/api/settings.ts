import { apiClient } from './client';

export interface AppSettings {
  id?: number;
  siteName?: string;
  address?: string;
  phone?: string;
  websiteBaseUrl?: string;
  logoUrl?: string;
}

export interface AppSettingsRequest {
  siteName?: string;
  address?: string;
  phone?: string;
  websiteBaseUrl?: string;
}

export const settingsApi = {
  get: async (): Promise<AppSettings> => {
    return apiClient.get<AppSettings>('/admin/settings');
  },

  update: async (data: AppSettingsRequest): Promise<AppSettings> => {
    return apiClient.put<AppSettings>('/admin/settings', data);
  },

  uploadLogo: async (file: File): Promise<AppSettings> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<AppSettings>('/admin/settings/logo', formData);
  },
};
