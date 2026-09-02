import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { UserRole } from "@daih/types";
import { config } from "../../config/env.js";
import { prisma } from "../../db/client.js";
import { redis } from "../../config/redis.js";
import { passwordService } from "./password.service.js";
import {
  JwtTokenPayload,
  SessionContext,
  UserSummaryDTO,
} from "./identity.types.js";

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
   * Mark session active in Redis cache
   */
  async markSessionActiveInCache(sessionId: string): Promise<void> {
    try {
      await redis.setex(`daih:session:active:${sessionId}`, 900, "1");
      await redis.del(`daih:session:revoked:${sessionId}`);
    } catch {
      // Non-blocking cache error
    }
  }

  /**
   * Mark session revoked in Redis cache
   */
  async markSessionRevokedInCache(sessionId: string): Promise<void> {
    try {
      await redis.del(`daih:session:active:${sessionId}`);
      await redis.setex(`daih:session:revoked:${sessionId}`, 900, "1");
    } catch {
      // Non-blocking cache error
    }
  }

  /**
   * Creates a new authenticated session with an access token and an HttpOnly refresh token
   */
  async createSession(
    user: UserSummaryDTO,
    context: SessionContext = {},
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

    await this.markSessionActiveInCache(session.id);

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
   * Includes a 10-second concurrency grace window to prevent race-condition false-positives.
   */
  async rotateRefreshToken(
    rawRefreshToken: string,
    context: SessionContext = {},
  ): Promise<{
    accessToken: string;
    rawRefreshToken: string;
    user: UserSummaryDTO;
  }> {
    const tokenHash = passwordService.hashToken(rawRefreshToken);

    const session = await prisma.authSession.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // If session is already marked revoked -> Check grace window for concurrent requests
    if (session.isRevoked) {
      const GRACE_WINDOW_MS = 15 * 1000; // 15-second grace window for concurrent/in-flight requests
      const timeSinceRevocation =
        Date.now() - new Date(session.updatedAt).getTime();

      if (timeSinceRevocation <= GRACE_WINDOW_MS) {
        // Find newest active session in this family created during the rotation
        const activeSession = await prisma.authSession.findFirst({
          where: {
            tokenFamily: session.tokenFamily,
            isRevoked: false,
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
          orderBy: { createdAt: "desc" },
        });

        if (activeSession && activeSession.user) {
          const nextRawRefreshToken = passwordService.generateSecureToken(32);
          const nextRefreshTokenHash =
            passwordService.hashToken(nextRawRefreshToken);
          const nextExpiresAt = new Date();
          nextExpiresAt.setDate(
            nextExpiresAt.getDate() + config.jwt.refreshExpiresInDays,
          );

          const rotatedSession = await prisma.authSession.create({
            data: {
              userId: activeSession.userId,
              refreshTokenHash: nextRefreshTokenHash,
              tokenFamily: activeSession.tokenFamily,
              ipAddress: context.ipAddress || activeSession.ipAddress,
              userAgent: context.userAgent || activeSession.userAgent,
              expiresAt: nextExpiresAt,
              lastUsedAt: new Date(),
            },
            include: { user: true },
          });

          await this.markSessionActiveInCache(rotatedSession.id);

          const u = activeSession.user;
          const userSummary: UserSummaryDTO = {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            phoneNumber: u.phoneNumber,
            avatarUrl: (u as any).avatarUrl || null,
            birthday: (u as any).birthday || null,
            clientId: u.clientId,
            role: u.role as UserRole,
            isVerified: u.isVerified,
            createdAt: u.createdAt,
            referralCode: (u as any).referralCode || null,
          };

          const accessToken = this.generateAccessToken({
            id: userSummary.id,
            email: userSummary.email,
            role: userSummary.role,
            clientId: userSummary.clientId,
            sessionId: rotatedSession.id,
          });

          return {
            accessToken,
            rawRefreshToken: nextRawRefreshToken,
            user: userSummary,
          };
        }
      }

      // Beyond grace window or no active session -> Token reuse attack detected, revoke entire token family
      const revokedSessions = await prisma.authSession.findMany({
        where: { tokenFamily: session.tokenFamily },
        select: { id: true },
      });

      await prisma.authSession.updateMany({
        where: { tokenFamily: session.tokenFamily },
        data: { isRevoked: true },
      });

      for (const s of revokedSessions) {
        await this.markSessionRevokedInCache(s.id);
      }

      throw new Error("REFRESH_TOKEN_REUSE_DETECTED");
    }

    // Expiry check
    if (session.expiresAt < new Date()) {
      await prisma.authSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      await this.markSessionRevokedInCache(session.id);
      throw new Error("SESSION_EXPIRED");
    }

    // Generate rotated refresh token
    const nextRawRefreshToken = passwordService.generateSecureToken(32);
    const nextRefreshTokenHash = passwordService.hashToken(nextRawRefreshToken);

    const nextExpiresAt = new Date();
    nextExpiresAt.setDate(
      nextExpiresAt.getDate() + config.jwt.refreshExpiresInDays,
    );

    // Revoke previous session
    await prisma.authSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });
    await this.markSessionRevokedInCache(session.id);

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

    await this.markSessionActiveInCache(newSession.id);

    const u = (newSession as any).user || session.user;
    const userSummary: UserSummaryDTO = {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phoneNumber: u.phoneNumber,
      avatarUrl: (u as any).avatarUrl || null,
      birthday: (u as any).birthday || null,
      clientId: u.clientId,
      role: (u.role || session.user.role) as UserRole,
      isVerified: u.isVerified ?? session.user.isVerified,
      createdAt: u.createdAt || session.user.createdAt,
      referralCode: (u as any).referralCode || null,
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
    const sessions = await prisma.authSession.findMany({
      where: { refreshTokenHash: tokenHash },
      select: { id: true },
    });

    await prisma.authSession.updateMany({
      where: { refreshTokenHash: tokenHash },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });

    for (const s of sessions) {
      await this.markSessionRevokedInCache(s.id);
    }
  }

  /**
   * Revokes the session associated with a session ID (Logout)
   */
  async revokeSessionById(sessionId: string): Promise<void> {
    await prisma.authSession.updateMany({
      where: { id: sessionId },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });
    await this.markSessionRevokedInCache(sessionId);
  }

  /**
   * Revokes all active sessions for a user (e.g. after password reset)
   * Supports explicit session IDs list for immediate cache purge
   */
  async revokeAllUserSessions(
    userId: string,
    explicitSessionIds?: string[],
  ): Promise<void> {
    if (explicitSessionIds && explicitSessionIds.length > 0) {
      for (const id of explicitSessionIds) {
        await this.markSessionRevokedInCache(id);
      }
    }

    const sessions = await prisma.authSession.findMany({
      where: { userId },
      select: { id: true },
    });

    await prisma.authSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });

    for (const s of sessions) {
      await this.markSessionRevokedInCache(s.id);
    }
  }
}

export const sessionService = new SessionService();
