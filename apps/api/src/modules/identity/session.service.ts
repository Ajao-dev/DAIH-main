import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserRole } from '@daih/types';
import { config } from '../../config/env.js';
import { prisma } from '../../db/client.js';
import { passwordService } from './password.service.js';
import { JwtTokenPayload, SessionContext, UserSummaryDTO } from './identity.types.js';

export class SessionService {
  /**
   * Generates a short-lived JWT access token
   */
  generateAccessToken(payload: JwtTokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }

  /**
   * Verifies and decodes a JWT access token
   */
  verifyAccessToken(token: string): JwtTokenPayload {
    return jwt.verify(token, config.jwt.secret) as JwtTokenPayload;
  }

  /**
   * Creates a new authenticated session with an access token and an HttpOnly refresh token
   */
  async createSession(
    user: UserSummaryDTO,
    context: SessionContext = {}
  ): Promise<{ accessToken: string; rawRefreshToken: string }> {
    const rawRefreshToken = passwordService.generateSecureToken(32);
    const refreshTokenHash = passwordService.hashToken(rawRefreshToken);
    const tokenFamily = randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

    const session = await prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        tokenFamily,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });

    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      sessionId: session.id,
    });

    return { accessToken, rawRefreshToken };
  }

  /**
   * Rotates a refresh token, issuing a new access token and rotating the refresh token.
   * If token reuse is detected (attempting to use an already-rotated or revoked token),
   * all sessions in that token family are revoked.
   */
  async rotateRefreshToken(
    rawRefreshToken: string,
    context: SessionContext = {}
  ): Promise<{ accessToken: string; rawRefreshToken: string; user: UserSummaryDTO }> {
    const tokenHash = passwordService.hashToken(rawRefreshToken);

    const session = await prisma.authSession.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // If session is already marked revoked, verify if it was revoked within the grace window (15s)
    if (session.isRevoked) {
      const now = Date.now();
      const lastUsed = session.lastUsedAt ? new Date(session.lastUsedAt).getTime() : 0;
      const gracePeriodMs = 15000; // 15 seconds grace window for concurrent requests

      if (now - lastUsed <= gracePeriodMs) {
        // Issue new access token for the active user without creating duplicate chain
        const userSummary: UserSummaryDTO = {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          phoneNumber: session.user.phoneNumber,
          clientId: session.user.clientId,
          role: session.user.role as UserRole,
          isVerified: session.user.isVerified,
          createdAt: session.user.createdAt,
        };

        const accessToken = this.generateAccessToken({
          id: userSummary.id,
          email: userSummary.email,
          role: userSummary.role,
          clientId: userSummary.clientId,
          sessionId: session.id,
        });

        return {
          accessToken,
          rawRefreshToken,
          user: userSummary,
        };
      }

      // Beyond grace period -> Revoke entire token family to prevent replay attacks
      await prisma.authSession.updateMany({
        where: { tokenFamily: session.tokenFamily },
        data: { isRevoked: true },
      });

      throw new Error('REFRESH_TOKEN_REUSE_DETECTED');
    }

    // Expiry check
    if (session.expiresAt < new Date()) {
      await prisma.authSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new Error('SESSION_EXPIRED');
    }

    // Generate rotated refresh token
    const nextRawRefreshToken = passwordService.generateSecureToken(32);
    const nextRefreshTokenHash = passwordService.hashToken(nextRawRefreshToken);

    const nextExpiresAt = new Date();
    nextExpiresAt.setDate(nextExpiresAt.getDate() + config.jwt.refreshExpiresInDays);

    // Revoke previous session
    await prisma.authSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    // Create next session in the same token family
    const newSession = await prisma.authSession.create({
      data: {
        userId: session.userId,
        refreshTokenHash: nextRefreshTokenHash,
        tokenFamily: session.tokenFamily,
        ipAddress: context.ipAddress || session.ipAddress,
        userAgent: context.userAgent || session.userAgent,
        expiresAt: nextExpiresAt,
        lastUsedAt: new Date(),
      },
      include: { user: true },
    });

    const userSummary: UserSummaryDTO = {
      id: (newSession as any).user?.id || session.user.id,
      email: (newSession as any).user?.email || session.user.email,
      firstName: (newSession as any).user?.firstName || session.user.firstName,
      lastName: (newSession as any).user?.lastName || session.user.lastName,
      phoneNumber: (newSession as any).user?.phoneNumber || session.user.phoneNumber,
      clientId: (newSession as any).user?.clientId || session.user.clientId,
      role: ((newSession as any).user?.role || session.user.role) as UserRole,
      isVerified: (newSession as any).user?.isVerified ?? session.user.isVerified,
      createdAt: (newSession as any).user?.createdAt || session.user.createdAt,
    };

    const accessToken = this.generateAccessToken({
      id: userSummary.id,
      email: userSummary.email,
      role: userSummary.role,
      clientId: userSummary.clientId,
      sessionId: newSession.id,
    });

    return {
      accessToken,
      rawRefreshToken: nextRawRefreshToken,
      user: userSummary,
    };
  }

  /**
   * Revokes the session associated with the given raw refresh token (Logout)
   */
  async revokeSessionByRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = passwordService.hashToken(rawRefreshToken);
    await prisma.authSession.updateMany({
      where: { refreshTokenHash: tokenHash },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });
  }

  /**
   * Revokes the session associated with a session ID (Logout)
   */
  async revokeSessionById(sessionId: string): Promise<void> {
    await prisma.authSession.updateMany({
      where: { id: sessionId },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });
  }

  /**
   * Revokes all active sessions for a user (e.g. after password reset)
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.authSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });
  }
}

export const sessionService = new SessionService();
