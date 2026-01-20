import { apiClient } from './client';

export interface Employee {
  id: number;
  userId?: number;
  fullName: string;
  position?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  joinDate?: string;
  email?: string;
  profilePhotoPath?: string;
  profilePhotoUrl?: string;
}

export interface EmployeeCreateRequest {
  email: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE';
  fullName: string;
  position?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  joinDate?: string;
}

export interface EmployeeUpdateRequest {
  fullName: string;
  position?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  joinDate?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export const employeeApi = {
  // Admin endpoints
  listAll: async (): Promise<Employee[]> => {
    return apiClient.get<Employee[]>('/admin/employees');
  },

  getById: async (id: number): Promise<Employee> => {
    return apiClient.get<Employee>(`/admin/employees/${id}`);
  },

  create: async (data: EmployeeCreateRequest): Promise<Employee> => {
    return apiClient.post<Employee>('/admin/employees', data);
  },

  update: async (id: number, data: EmployeeUpdateRequest): Promise<Employee> => {
    return apiClient.put<Employee>(`/admin/employees/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/admin/employees/${id}`);
  },

  // Employee self-service endpoints
  getProfile: async (): Promise<Employee> => {
    return apiClient.get<Employee>('/employee/profile');
  },

  updateProfile: async (data: EmployeeUpdateRequest): Promise<Employee> => {
    return apiClient.put<Employee>('/employee/profile', data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post<void>('/employee/profile/password', data);
  },

  uploadProfilePhoto: async (file: File): Promise<Employee> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<Employee>('/employee/profile/photo', formData);
  },
};
