import { Router } from 'express';
import { Permission } from '@daih/types';
import { identityController } from './identity.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody, validateQuery } from '../../middleware/validate.middleware.js';
import {
  loginRateLimiter,
  registrationRateLimiter,
  verificationResendRateLimiter,
  passwordResetRateLimiter,
  refreshRateLimiter,
} from '../../middleware/rate-limit.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  createStaffUserSchema,
} from './identity.schema.js';

export const identityRouter = Router();

// Public Authentication & Verification Endpoints
identityRouter.post(
  '/register',
  registrationRateLimiter,
  validateBody(registerSchema),
  identityController.register
);

identityRouter.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  identityController.login
);

identityRouter.post(
  '/refresh',
  refreshRateLimiter,
  identityController.refresh
);

identityRouter.post(
  '/logout',
  identityController.logout
);

identityRouter.get(
  '/verify-email',
  validateQuery(verifyEmailSchema),
  identityController.verifyEmail
);

identityRouter.post(
  '/resend-verification',
  verificationResendRateLimiter,
  validateBody(resendVerificationSchema),
  identityController.resendVerification
);

identityRouter.post(
  '/password-reset/request',
  passwordResetRateLimiter,
  validateBody(requestPasswordResetSchema),
  identityController.requestPasswordReset
);

identityRouter.post(
  '/password-reset/confirm',
  validateBody(confirmPasswordResetSchema),
  identityController.confirmPasswordReset
);

// Protected Endpoints
identityRouter.get(
  '/me',
  authenticate,
  identityController.getProfile
);

// Super Admin / Management Protected Endpoints
identityRouter.get(
  '/admin/users',
  authenticate,
  requirePermission(Permission.USERS_MANAGE),
  identityController.getStaffUsers
);

identityRouter.post(
  '/admin/users',
  authenticate,
  requirePermission(Permission.USERS_MANAGE),
  validateBody(createStaffUserSchema),
  identityController.createStaffUser
);

