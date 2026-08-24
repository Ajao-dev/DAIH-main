import { Prisma, User, UserRole } from '@prisma/client';
import { prisma } from '../../db/client.js';
import { config } from '../../config/env.js';

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  clientId: string;
  policyVersion: string;
  rawVerificationToken: string;
  verificationTokenHash: string;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  passwordHash?: string;
  clientId: string;
  isVerified?: boolean;
}

export class IdentityRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByClientId(clientId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clientId },
    });
  }

  /**
   * Atomically registers a customer, captures policy consent, stores verification token,
   * and records outbox domain events in a single database transaction.
   */
  async createCustomer(data: CreateCustomerData): Promise<User> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.jwt.verificationExpiresInHours);

    return prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          passwordHash: data.passwordHash,
          clientId: data.clientId,
          role: UserRole.CUSTOMER,
          isVerified: false,
        },
      });

      // 2. Record Policy Consent
      await tx.policyConsent.create({
        data: {
          userId: user.id,
          policyVersion: data.policyVersion,
          purpose: 'TERMS_AND_PRIVACY_AGREEMENT',
        },
      });

      // 3. Store Verification Token Hash
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash: data.verificationTokenHash,
          expiresAt,
        },
      });

      // 4. Record Transactional Outbox Events
      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.user_registered',
          aggregateType: 'User',
          aggregateId: user.id,
          payload: {
            userId: user.id,
            email: user.email,
            clientId: user.clientId,
            role: user.role,
          },
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.policy_consent_captured',
          aggregateType: 'PolicyConsent',
          aggregateId: user.id,
          payload: {
            userId: user.id,
            policyVersion: data.policyVersion,
            consentedAt: new Date().toISOString(),
          },
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.email_verification_requested',
          aggregateType: 'User',
          aggregateId: user.id,
          payload: {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            rawToken: data.rawVerificationToken,
          },
        },
      });

      return user;
    });
  }

  /**
   * Atomically verifies email if token is valid and unexpired
   */
  async verifyUserByTokenHash(tokenHash: string): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const record = await tx.verificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!record) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      if (record.usedAt) {
        throw new Error('TOKEN_ALREADY_USED');
      }

      if (record.expiresAt < new Date()) {
        throw new Error('TOKEN_EXPIRED');
      }

      // Mark token as used
      await tx.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      // Mark user as verified
      const updatedUser = await tx.user.update({
        where: { id: record.userId },
        data: { isVerified: true },
      });

      // Record outbox event
      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.email_verified',
          aggregateType: 'User',
          aggregateId: updatedUser.id,
          payload: {
            userId: updatedUser.id,
            email: updatedUser.email,
            verifiedAt: new Date().toISOString(),
          },
        },
      });

      return updatedUser;
    });
  }

  /**
   * Creates a new verification token for resending
   */
  async createVerificationToken(
    userId: string,
    tokenHash: string,
    rawToken?: string,
    email?: string,
    firstName?: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.jwt.verificationExpiresInHours);

    await prisma.$transaction(async (tx) => {
      // Invalidate older unused tokens for this user
      await tx.verificationToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.verificationToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.email_verification_requested',
          aggregateType: 'User',
          aggregateId: userId,
          payload: {
            userId,
            email,
            firstName,
            rawToken,
            requestedAt: new Date().toISOString(),
          },
        },
      });
    });
  }

  /**
   * Stores a password reset token hash and emits outbox event
   */
  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    rawToken?: string,
    email?: string,
    firstName?: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.jwt.passwordResetExpiresInHours);

    await prisma.$transaction(async (tx) => {
      // Invalidate older unused reset tokens
      await tx.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.password_reset_requested',
          aggregateType: 'User',
          aggregateId: userId,
          payload: {
            userId,
            email,
            firstName,
            rawToken,
            requestedAt: new Date().toISOString(),
          },
        },
      });
    });
  }

  /**
   * Resets user password, marks reset token used, and emits outbox event
   */
  async resetPasswordByTokenHash(tokenHash: string, newPasswordHash: string): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const record = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
      });

      if (!record) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      if (record.usedAt) {
        throw new Error('TOKEN_ALREADY_USED');
      }

      if (record.expiresAt < new Date()) {
        throw new Error('TOKEN_EXPIRED');
      }

      // Mark token used
      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      // Update password
      const updatedUser = await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all existing sessions for this user
      await tx.authSession.updateMany({
        where: { userId: record.userId, isRevoked: false },
        data: { isRevoked: true, lastUsedAt: new Date() },
      });

      // Emit outbox event
      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.password_changed',
          aggregateType: 'User',
          aggregateId: updatedUser.id,
          payload: {
            userId: updatedUser.id,
            changedAt: new Date().toISOString(),
          },
        },
      });

      return updatedUser;
    });
  }

  /**
   * Creates a staff user account
   */
  async createStaffUser(data: CreateStaffData & { setupToken?: string }): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          role: data.role,
          passwordHash: data.passwordHash,
          clientId: data.clientId,
          isVerified: data.isVerified ?? true,
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'identity.staff_user_created',
          aggregateType: 'User',
          aggregateId: user.id,
          payload: {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            role: user.role,
            clientId: user.clientId,
            setupToken: data.setupToken,
          },
        },
      });

      return user;
    });
  }

  /**
   * Lists all staff and administrative users
   */
  async listStaffUsers(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: {
          not: UserRole.CUSTOMER,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const identityRepository = new IdentityRepository();
