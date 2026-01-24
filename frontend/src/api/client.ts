/**
 * API Client untuk Backend Java Spring Boot
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apitny.uctech.online/api';

export interface ApiResponse<T> {
  data: T;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Generic pagination response sesuai backend PageResponse
export interface PageResponse<T> {
  content: T[];
  page: number;          // 1-based index dari backend
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('sikep_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized — redirect ke landing (bukan login)
    if (response.status === 401) {
      localStorage.removeItem('sikep_token');
      localStorage.removeItem('sikep_active_user');
      window.location.href = '#/landing';
      throw new Error('Sesi berakhir, silakan login kembali');
    }

    // Handle errors
    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan pada server';
      try {
        const errorData: ErrorResponse = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse response - handle both wrapped {data: ...} and direct object/array
    const jsonData = await response.json();
    if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData) && 'data' in jsonData) {
      // Wrapped format: {data: ...}
      return (jsonData as ApiResponse<T>).data;
    } else {
      // Direct format: object atau array langsung
      return jsonData as T;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('sikep_token');
      localStorage.removeItem('sikep_active_user');
      window.location.href = '#/landing';
      throw new Error('Sesi berakhir, silakan login kembali');
    }

    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan pada server';
      try {
        const errorData: ErrorResponse = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Handle empty response (204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null as T;
    }

    // Parse response - handle both wrapped {data: ...} and direct object/array
    const jsonData = await response.json();
    if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData) && 'data' in jsonData) {
      // Wrapped format: {data: ...}
      return (jsonData as ApiResponse<T>).data;
    } else {
      // Direct format: object atau array langsung
      return jsonData as T;
    }
  }
}

export const apiClient = new ApiClient();
