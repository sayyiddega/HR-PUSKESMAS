import { apiClient, PageResponse } from './client';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LeaveRequestCreate {
  startDate: string;
  endDate: string;
  reason?: string;
}

export const leaveApi = {
  // Admin endpoints
  listAll: async (): Promise<LeaveRequest[]> => {
    return apiClient.get<LeaveRequest[]>('/admin/leaves');
  },

  // Admin - paged list (server-side pagination)
  listAllPaged: async (page: number, size: number): Promise<PageResponse<LeaveRequest>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    }).toString();
    return apiClient.get<PageResponse<LeaveRequest>>(`/admin/leaves/paged?${params}`);
  },

  approve: async (id: number): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>(`/admin/leaves/${id}/approve`);
  },

  reject: async (id: number): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>(`/admin/leaves/${id}/reject`);
  },

  // Employee endpoints
  listMyLeaves: async (): Promise<LeaveRequest[]> => {
    return apiClient.get<LeaveRequest[]>('/employee/leaves');
  },

  create: async (data: LeaveRequestCreate, attachment?: File): Promise<LeaveRequest> => {
    // Backend expects multipart/form-data with @RequestPart("data")
    // Send JSON as a string in FormData - backend will parse it manually
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (attachment) {
      formData.append('attachment', attachment);
    }
    return apiClient.postFormData<LeaveRequest>('/employee/leaves', formData);
  },
};
