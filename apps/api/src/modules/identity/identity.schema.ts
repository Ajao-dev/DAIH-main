import { z } from 'zod';
import { UserRole } from '@daih/types';

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phoneNumber: z.string().trim().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  policyVersion: z.string().trim().default('1.0'),
  consented: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service and privacy policy',
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  portal: z.string().trim().optional(),
  audience: z.string().trim().optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const createStaffUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phoneNumber: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).refine((role) => role !== UserRole.CUSTOMER, {
    message: 'Staff user role must be an administrative or staff role',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
});
