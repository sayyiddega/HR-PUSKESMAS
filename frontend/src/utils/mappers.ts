/**
 * Utility functions untuk mapping data dari backend ke format frontend
 */

import { User, UserRole, DocumentType, LeaveRequest, LeaveStatus, Settings, UserDocument } from '../../types';
import * as EmployeeApi from '../api/employee';
import * as DocumentApi from '../api/document';
import * as LeaveApi from '../api/leave';
import * as SettingsApi from '../api/settings';

// Map Employee dari backend ke User format frontend
export const mapEmployeeToUser = (emp: EmployeeApi.Employee, role: UserRole = UserRole.PEGAWAI): User => {
  return {
    id: emp.id.toString(),
    username: emp.email || '',
    fullName: emp.fullName,
    nip: emp.nip || emp.id.toString(), // Fallback ke id jika NIP belum diisi
    role,
    position: emp.position || '',
    department: emp.department,
    phone: emp.phone,
    address: emp.address,
    dateOfBirth: emp.dateOfBirth,
    joinDate: emp.joinDate,
    profilePhotoUrl: emp.profilePhotoUrl, // New field for profile photo
    nik: emp.nik,
    gender: emp.gender,
    placeOfBirth: emp.placeOfBirth,
    maritalStatus: emp.maritalStatus,
    religion: emp.religion,
    lastEducation: emp.lastEducation,
    rankGolongan: emp.rankGolongan,
    employmentStatus: emp.employmentStatus,
    remainingLeaveDays: typeof emp.remainingLeaveDays === 'number' ? emp.remainingLeaveDays : undefined,
    status: 'Aktif' as const, // Backend doesn't have status field, always active
    documents: [], // Akan diisi dari endpoint terpisah
  };
};

// Map DocumentType dari backend ke format frontend
export const mapDocumentType = (dt: DocumentApi.DocumentType): DocumentType => {
  return {
    id: dt.id.toString(),
    name: dt.name,
    description: dt.description,
    isRequired: dt.mandatory,
  };
};

// Map EmployeeDocument dari backend ke UserDocument format frontend
export const mapEmployeeDocument = (ed: DocumentApi.EmployeeDocument): UserDocument => {
  return {
    id: ed.id.toString(),
    documentTypeId: ed.documentTypeId.toString(),
    documentTypeName: ed.documentTypeName,
    originalFilename: ed.originalFilename,
    fileUrl: ed.fileUrl || '',
    uploadedAt: ed.uploadedAt,
  };
};

// Map LeaveRequest dari backend ke format frontend
export const mapLeaveRequest = (lr: LeaveApi.LeaveRequest): LeaveRequest => {
  return {
    id: lr.id.toString(),
    userId: lr.employeeId.toString(),
    userName: lr.employeeName || '',
    type: 'CUTI' as any, // Backend tidak punya type, default ke CUTI
    startDate: lr.startDate,
    endDate: lr.endDate,
    reason: lr.reason || '',
    status: lr.status as LeaveStatus,
    createdAt: lr.createdAt,
  };
};

// Map Settings dari backend ke format frontend
export const mapSettings = (s: SettingsApi.AppSettings): Settings => {
  return {
    webName: s.siteName || 'SIKEP PUSKESMAS',
    logoUrl: s.logoUrl || '',
    landingHeroImageUrl: s.landingHeroImageUrl,
    address: s.address || '',
    phone: s.phone || '',
    websiteBaseUrl: s.websiteBaseUrl,
    email: '', // Backend tidak punya email field, display only
    landingHeroBadge: s.landingHeroBadge,
    landingHeroTitle: s.landingHeroTitle,
    landingHeroSubtitle: s.landingHeroSubtitle,
    landingStatusText: s.landingStatusText,
    landingVisionText: s.landingVisionText,
    landingMission1: s.landingMission1,
    landingMission2: s.landingMission2,
    landingMission3: s.landingMission3,
    landingFooterText: s.landingFooterText,
  };
};

// Helper untuk mendapatkan role dari JWT token (jika ada)
export const getUserRoleFromToken = (token: string): UserRole => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'ADMIN' ? UserRole.ADMIN : UserRole.PEGAWAI;
  } catch {
    return UserRole.PEGAWAI;
  }
};
