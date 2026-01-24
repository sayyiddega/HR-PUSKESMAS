import { apiClient } from './client';

export interface AdminDashboardStats {
  totalEmployees: number;
  totalDocumentTypes: number;
  uploadedDocuments: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  employeesWithCompleteDocs: number;
  employeesWithIncompleteDocs: number;
  positionDistribution: Record<string, number>;
  documentsNeedReview: number;
}

export interface EmployeeDashboardStats {
  employeeId: number;
  totalDocumentTypes: number;
  uploadedDocuments: number;
  mandatoryDocsUploaded: number;
  mandatoryDocsMissing: number;
  pendingLeaves: number;
  approvedLeaves: number;
  latestLeaveRequest?: {
    id: number;
    employeeId: number;
    employeeName?: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: string;
    attachmentUrl?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export const dashboardApi = {
  getAdminStats: async (): Promise<AdminDashboardStats> => {
    return apiClient.get<AdminDashboardStats>('/admin/dashboard');
  },

  getEmployeeStats: async (): Promise<EmployeeDashboardStats> => {
    return apiClient.get<EmployeeDashboardStats>('/employee/dashboard');
  },
};
