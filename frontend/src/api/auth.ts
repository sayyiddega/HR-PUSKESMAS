import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  position?: string;
  department?: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post<void>('/auth/logout');
  },
};
