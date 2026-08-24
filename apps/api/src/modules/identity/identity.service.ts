import { UserRole } from '@daih/types';
import { identityRepository } from './identity.repository.js';
import { passwordService } from './password.service.js';
import { clientIdService } from './client-id.service.js';
import { sessionService } from './session.service.js';
import { emailService } from '../email/email.service.js';
import {
  RegisterDTO,
  LoginDTO,
  UserSummaryDTO,
  SessionContext,
} from './identity.types.js';

export class IdentityService {
  /**
   * Registers a new customer account
   */
  async register(dto: RegisterDTO): Promise<{ user: UserSummaryDTO; verificationSent: boolean }> {
    const existing = await identityRepository.findByEmail(dto.email);
    if (existing) {
      const error: any = new Error('An account with this email already exists');
      error.code = 'EMAIL_ALREADY_EXISTS';
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await passwordService.hashPassword(dto.password);
    const clientId = await clientIdService.generateNextClientId();

    const rawVerificationToken = passwordService.generateSecureToken(32);
    const verificationTokenHash = passwordService.hashToken(rawVerificationToken);

    const user = await identityRepository.createCustomer({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      passwordHash,
      clientId,
      policyVersion: dto.policyVersion || '1.0',
      rawVerificationToken,
      verificationTokenHash,
    });

    // Send verification email directly as well for prompt UX
    try {
      await emailService.sendVerificationEmail(user.email, user.firstName, rawVerificationToken);
    } catch (err: any) {
      console.warn('Direct verification email send deferred to background outbox:', err?.message);
    }

    const userSummary: UserSummaryDTO = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      clientId: user.clientId,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return {
      user: userSummary,
      verificationSent: true,
    };
  }

  /**
   * Verifies customer email using verification token
   */
  async verifyEmail(rawToken: string): Promise<UserSummaryDTO> {
    const tokenHash = passwordService.hashToken(rawToken);

    try {
      const user = await identityRepository.verifyUserByTokenHash(tokenHash);
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        clientId: user.clientId,
        role: user.role as UserRole,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };
    } catch (err: any) {
      const error: any = new Error(
        err.message === 'TOKEN_ALREADY_USED'
          ? 'This verification token has already been used'
          : err.message === 'TOKEN_EXPIRED'
          ? 'This verification token has expired'
          : 'Invalid or expired verification token'
      );
      error.code = err.message || 'INVALID_VERIFICATION_TOKEN';
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Resends verification email for unverified user
   */
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const user = await identityRepository.findByEmail(email);
    if (user && !user.isVerified) {
      const rawToken = passwordService.generateSecureToken(32);
      const tokenHash = passwordService.hashToken(rawToken);
      await identityRepository.createVerificationToken(
        user.id,
        tokenHash,
        rawToken,
        user.email,
        user.firstName
      );

      try {
        await emailService.sendVerificationEmail(user.email, user.firstName, rawToken);
      } catch (err: any) {
        console.warn('Direct resend verification email deferred to background outbox:', err?.message);
      }
    }

    return {
      success: true,
      message: 'If an unverified account exists with that email, a verification link has been sent.',
    };
  }

  /**
   * Logs in an authenticated user
   */
  async login(
    dto: LoginDTO,
    context: SessionContext = {}
  ): Promise<{ accessToken: string; rawRefreshToken: string; user: UserSummaryDTO }> {
    const user = await identityRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      const error: any = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await passwordService.verifyPassword(user.passwordHash, dto.password);
    if (!isValidPassword) {
      const error: any = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    if (!user.isVerified) {
      const error: any = new Error('Please verify your email address before logging in');
      error.code = 'EMAIL_NOT_VERIFIED';
      error.statusCode = 403;
      throw error;
    }

    // Portal / Audience Role Boundary Enforcement
    const requestedPortal = (
      dto.portal ||
      dto.audience ||
      context.portal ||
      ''
    ).toLowerCase();

    if (requestedPortal === 'customer' && user.role !== UserRole.CUSTOMER) {
      const error: any = new Error(
        'Access Denied: Staff and Administrator accounts cannot sign in through the customer portal.'
      );
      error.code = 'STAFF_NOT_ALLOWED_ON_CUSTOMER_PORTAL';
      error.statusCode = 403;
      throw error;
    }

    if (requestedPortal === 'admin' && user.role === UserRole.CUSTOMER) {
      const error: any = new Error(
        'Access Denied: Customer accounts cannot access the Staff & Admin Console.'
      );
      error.code = 'CUSTOMER_NOT_ALLOWED_ON_ADMIN_PORTAL';
      error.statusCode = 403;
      throw error;
    }

    const userSummary: UserSummaryDTO = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      clientId: user.clientId,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    const { accessToken, rawRefreshToken } = await sessionService.createSession(userSummary, context);

    return {
      accessToken,
      rawRefreshToken,
      user: userSummary,
    };
  }

  /**
   * Rotates refresh token session
   */
  async refresh(
    rawRefreshToken: string,
    context: SessionContext = {}
  ): Promise<{ accessToken: string; rawRefreshToken: string; user: UserSummaryDTO }> {
    try {
      return await sessionService.rotateRefreshToken(rawRefreshToken, context);
    } catch (err: any) {
      const error: any = new Error(
        err.message === 'REFRESH_TOKEN_REUSE_DETECTED'
          ? 'Suspicious session activity detected. Please log in again.'
          : 'Invalid or expired session token'
      );
      error.code = err.message || 'UNAUTHORIZED';
      error.statusCode = 401;
      throw error;
    }
  }

  /**
   * Logs out user and revokes active session
   */
  async logout(rawRefreshToken?: string, sessionId?: string): Promise<void> {
    if (rawRefreshToken) {
      await sessionService.revokeSessionByRefreshToken(rawRefreshToken);
    }
    if (sessionId) {
      await sessionService.revokeSessionById(sessionId);
    }
  }

  /**
   * Requests a password reset token
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const user = await identityRepository.findByEmail(email);
    if (user) {
      const rawToken = passwordService.generateSecureToken(32);
      const tokenHash = passwordService.hashToken(rawToken);
      await identityRepository.createPasswordResetToken(
        user.id,
        tokenHash,
        rawToken,
        user.email,
        user.firstName
      );

      try {
        await emailService.sendPasswordResetEmail(user.email, user.firstName, rawToken);
      } catch (err: any) {
        console.warn('Direct password reset email deferred to outbox:', err?.message);
      }
    }

    return {
      success: true,
      message: 'If an account exists with that email, password reset instructions have been sent.',
    };
  }

  /**
   * Confirms password reset with new password
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const tokenHash = passwordService.hashToken(token);
    const newPasswordHash = await passwordService.hashPassword(newPassword);

    try {
      await identityRepository.resetPasswordByTokenHash(tokenHash, newPasswordHash);
      return {
        success: true,
        message: 'Your password has been successfully reset. You can now log in with your new password.',
      };
    } catch (err: any) {
      const error: any = new Error(
        err.message === 'TOKEN_ALREADY_USED'
          ? 'This reset link has already been used'
          : err.message === 'TOKEN_EXPIRED'
          ? 'This reset link has expired'
          : 'Invalid or expired password reset link'
      );
      error.code = err.message || 'INVALID_RESET_TOKEN';
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Fetches user profile by ID
   */
  async getProfile(userId: string): Promise<UserSummaryDTO> {
    const user = await identityRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      clientId: user.clientId,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}

export const identityService = new IdentityService();
