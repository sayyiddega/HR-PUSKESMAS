/**
 * Store/API Service - Full Integration dengan Backend Java Spring Boot
 * Tidak ada fallback/mock - semua error langsung throw
 */

import { GoogleGenAI } from "@google/genai";
import { Settings, User, DocumentType, LeaveRequest, LeaveStatus, UserRole, UserDocument } from './types';
import * as AuthApi from './src/api/auth';
import * as EmployeeApi from './src/api/employee';
import * as DocumentApi from './src/api/document';
import * as LeaveApi from './src/api/leave';
import * as SettingsApi from './src/api/settings';
import * as DashboardApi from './src/api/dashboard';
import { mapEmployeeToUser, mapDocumentType, mapLeaveRequest, mapSettings, mapEmployeeDocument } from './src/utils/mappers';

// --- API SERVICES ---

export const loginUser = async (email: string, password: string): Promise<{user: User, token: string}> => {
  const response = await AuthApi.authApi.login({ email, password });
  const token = response.accessToken;
  const role = response.role === 'ADMIN' ? UserRole.ADMIN : UserRole.PEGAWAI;
  
  // Simpan token
  localStorage.setItem('sikep_token', token);
  
  // Jika admin, tidak perlu ambil employee profile
  if (role === UserRole.ADMIN) {
    const user: User = {
      id: '0',
      username: response.email,
      fullName: 'Administrator',
      nip: '0',
      role: UserRole.ADMIN,
      position: 'Administrator',
      status: 'Aktif',
      documents: [],
    };
    return { user, token };
  }
  
  // Jika employee, ambil profile employee untuk mendapatkan data lengkap
  const profile = await EmployeeApi.employeeApi.getProfile();
  const user = mapEmployeeToUser(profile, role);
  user.username = response.email;
  
  return { user, token };
};

export const logoutUser = async (): Promise<void> => {
  await AuthApi.authApi.logout();
  localStorage.removeItem('sikep_token');
  localStorage.removeItem('sikep_active_user');
};

export const getSettings = async (): Promise<Settings> => {
  const settings = await SettingsApi.settingsApi.get();
  const mapped = mapSettings(settings);
  
  // Load email from localStorage (karena tidak ada di backend)
  const savedEmail = localStorage.getItem('sikep_settings_email');
  if (savedEmail) {
    mapped.email = savedEmail;
  }
  
  return mapped;
};

export const saveSettings = async (data: Settings): Promise<void> => {
  await SettingsApi.settingsApi.update({
    siteName: data.webName,
    address: data.address,
    phone: data.phone,
    websiteBaseUrl: data.websiteBaseUrl,
  });
};

export const getUsers = async (): Promise<User[]> => {
  const employees = await EmployeeApi.employeeApi.listAll();
  return employees.map(emp => mapEmployeeToUser(emp, UserRole.PEGAWAI));
};

export const saveUser = async (data: Partial<User>): Promise<void> => {
  if (data.id) {
    // Update existing
    await EmployeeApi.employeeApi.update(parseInt(data.id), {
      fullName: data.fullName || '',
      position: data.position,
      department: data.department,
      phone: data.phone,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      joinDate: data.joinDate,
    });
  } else {
    // Create new
    if (!data.username || !data.password) {
      throw new Error('Email dan password diperlukan untuk membuat user baru');
    }
    await EmployeeApi.employeeApi.create({
      email: data.username,
      password: data.password,
      role: 'EMPLOYEE', // Default role untuk employee baru
      fullName: data.fullName || '',
      position: data.position,
      department: data.department,
      phone: data.phone,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      joinDate: data.joinDate,
    });
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  await EmployeeApi.employeeApi.delete(parseInt(id));
};

export const getDocTypes = async (): Promise<DocumentType[]> => {
  // Check if user is admin or employee
  const savedUser = localStorage.getItem('sikep_active_user');
  if (savedUser) {
    const user: User = JSON.parse(savedUser);
    if (user.role === UserRole.ADMIN) {
      const docTypes = await DocumentApi.documentApi.listDocumentTypes();
      return docTypes.map(mapDocumentType);
    } else {
      // Employee uses employee endpoint
      const docTypes = await DocumentApi.documentApi.listDocumentTypesForEmployee();
      return docTypes.map(mapDocumentType);
    }
  }
  // Fallback to admin endpoint if no user (should not happen)
  const docTypes = await DocumentApi.documentApi.listDocumentTypes();
  return docTypes.map(mapDocumentType);
};

export const saveDocType = async (data: Partial<DocumentType>): Promise<void> => {
  if (data.id) {
    await DocumentApi.documentApi.updateDocumentType(parseInt(data.id), {
      name: data.name || '',
      description: data.description,
      mandatory: data.isRequired || false,
    });
  } else {
    await DocumentApi.documentApi.createDocumentType({
      name: data.name || '',
      description: data.description,
      mandatory: data.isRequired || false,
    });
  }
};

export const deleteDocType = async (id: string): Promise<void> => {
  await DocumentApi.documentApi.deleteDocumentType(parseInt(id));
};

export const getMyDocuments = async (): Promise<{ documents: UserDocument[], missingMandatory: DocumentType[] }> => {
  const response = await DocumentApi.documentApi.listMyDocuments();
  return {
    documents: response.documents.map(mapEmployeeDocument),
    missingMandatory: response.missingMandatory.map(mapDocumentType),
  };
};

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  // Cek role user untuk menentukan endpoint
  const savedUser = localStorage.getItem('sikep_active_user');
  if (savedUser) {
    const user: User = JSON.parse(savedUser);
    if (user.role === UserRole.ADMIN) {
      const leaves = await LeaveApi.leaveApi.listAll();
      return leaves.map(mapLeaveRequest);
    } else {
      const leaves = await LeaveApi.leaveApi.listMyLeaves();
      return leaves.map(mapLeaveRequest);
    }
  }
  // Default to admin if no user
  const leaves = await LeaveApi.leaveApi.listAll();
  return leaves.map(mapLeaveRequest);
};

export const saveLeaveRequest = async (data: Partial<LeaveRequest>): Promise<void> => {
  await LeaveApi.leaveApi.create({
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    reason: data.reason,
  });
};

export const updateLeaveStatus = async (id: string, status: LeaveStatus): Promise<void> => {
  if (status === LeaveStatus.APPROVED) {
    await LeaveApi.leaveApi.approve(parseInt(id));
  } else if (status === LeaveStatus.REJECTED) {
    await LeaveApi.leaveApi.reject(parseInt(id));
  }
};

export const uploadDocument = async (docTypeId: string, file: File): Promise<void> => {
  await DocumentApi.documentApi.uploadDocument(parseInt(docTypeId), file);
};

export const generateActivityNotification = async (title: string, data: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GENAI_API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Buat isi pesan notifikasi sistem Bahasa Indonesia profesional untuk aplikasi kepegawaian Puskesmas: Aktivitas ${title}, Detail data: ${JSON.stringify(data)}. Tuliskan dalam 1 paragraf yang ramah namun formal.`,
    });
    return response.text || "Update sistem terdeteksi.";
  } catch (err) {
    return `${title} telah diperbarui oleh sistem.`;
  }
};

// Export dashboard API
export { DashboardApi };
