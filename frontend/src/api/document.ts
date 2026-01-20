import { apiClient } from './client';

export interface DocumentType {
  id: number;
  name: string;
  description?: string;
  mandatory: boolean;
  createdAt?: string;
}

export interface DocumentTypeRequest {
  name: string;
  description?: string;
  mandatory: boolean;
}

export interface EmployeeDocument {
  id: number;
  documentTypeId: number;
  documentTypeName?: string;
  originalFilename: string;
  fileUrl?: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface EmployeeDocumentListResponse {
  documents: EmployeeDocument[];
  missingMandatory: DocumentType[];
}

export interface EmployeeDocumentGroupResponse {
  employeeId: number;
  employeeName: string;
  employeeEmail?: string;
  documents: EmployeeDocument[];
}

export const documentApi = {
  // Document Types (Admin)
  listDocumentTypes: async (): Promise<DocumentType[]> => {
    return apiClient.get<DocumentType[]>('/admin/document-types');
  },

  // Document Types (Employee - Read-only)
  listDocumentTypesForEmployee: async (): Promise<DocumentType[]> => {
    return apiClient.get<DocumentType[]>('/employee/documents/types');
  },

  getDocumentType: async (id: number): Promise<DocumentType> => {
    return apiClient.get<DocumentType>(`/admin/document-types/${id}`);
  },

  createDocumentType: async (data: DocumentTypeRequest): Promise<DocumentType> => {
    return apiClient.post<DocumentType>('/admin/document-types', data);
  },

  updateDocumentType: async (id: number, data: DocumentTypeRequest): Promise<DocumentType> => {
    return apiClient.put<DocumentType>(`/admin/document-types/${id}`, data);
  },

  deleteDocumentType: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/admin/document-types/${id}`);
  },

  // Employee Documents (Admin - List all)
  listAllUploads: async (documentTypeId?: number): Promise<EmployeeDocumentGroupResponse[]> => {
    const query = documentTypeId ? `?documentTypeId=${documentTypeId}` : '';
    return apiClient.get<EmployeeDocumentGroupResponse[]>(`/admin/documents/uploads${query}`);
  },

  // Employee Documents (Self-service)
  listMyDocuments: async (): Promise<EmployeeDocumentListResponse> => {
    return apiClient.get<EmployeeDocumentListResponse>('/employee/documents');
  },

  uploadDocument: async (documentTypeId: number, file: File): Promise<EmployeeDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<EmployeeDocument>(
      `/employee/documents/${documentTypeId}/upload`,
      formData
    );
  },

  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/employee/documents/${id}`);
  },
};
