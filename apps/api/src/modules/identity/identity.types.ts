import { UserRole } from '@daih/types';

export interface UserSummaryDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  clientId: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  policyVersion: string;
  consented: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
  portal?: 'customer' | 'admin' | string;
  audience?: 'CUSTOMER' | 'ADMIN' | string;
}

export interface CreateStaffUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  password?: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: UserSummaryDTO;
  verificationSent?: boolean;
}

export interface JwtTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  clientId: string;
  sessionId?: string;
}

export interface SessionContext {
  ipAddress?: string;
  userAgent?: string;
  portal?: string;
}
