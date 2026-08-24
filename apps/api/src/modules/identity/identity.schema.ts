import { z } from "zod";
import { UserRole } from "@daih/types";
import { sanitizeString } from "../../middleware/validate.middleware.js";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .transform(sanitizeString),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .transform(sanitizeString),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  policyVersion: z.string().trim().default("1.0"),
  consented: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of service and privacy policy",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  portal: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  audience: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
});

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, "Verification token is required")
    .transform(sanitizeString),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required").transform(sanitizeString),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export const createStaffUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .transform(sanitizeString),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .transform(sanitizeString),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  role: z.nativeEnum(UserRole).refine((role) => role !== UserRole.CUSTOMER, {
    message: "Staff user role must be an administrative or staff role",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
});

export const customerFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  tier: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const createCustomerAdminSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .transform(sanitizeString),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .transform(sanitizeString),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  tier: z.string().trim().optional(),
});
