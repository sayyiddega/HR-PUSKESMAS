
export enum UserRole {
  ADMIN = 'ADMIN',
  PEGAWAI = 'PEGAWAI'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum LeaveType {
  CUTI = 'CUTI',
  SAKIT = 'SAKIT',
  IZIN = 'IZIN'
}

export interface Settings {
  webName: string; // Maps to backend 'siteName'
  logoUrl: string; // Maps to backend 'logoUrl'
  address: string;
  phone: string;
  websiteBaseUrl?: string; // Maps to backend 'websiteBaseUrl'
  email: string; // Display only - not in backend
}

export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean; // Maps to backend 'mandatory'
}

export interface UserDocument {
  id: string;
  documentTypeId: string;
  documentTypeName?: string;
  originalFilename: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface User {
  id: string;
  username: string; // Email from backend
  password?: string;
  fullName: string;
  nip: string; // Display only - using id as fallback
  role: UserRole;
  position: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  joinDate?: string;
  profilePhotoUrl?: string; // New field for profile photo
  status: 'Aktif' | 'Non-Aktif'; // Display only - always 'Aktif' from backend
  documents: UserDocument[];
}
