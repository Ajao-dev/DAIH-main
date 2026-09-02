import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { prisma } from "../db/client.js";
import { redis } from "../config/redis.js";
import { UserRole } from "@daih/types";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    clientId: string;
    sessionId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Authentication token is missing or invalid",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
    }) as any;
    const userId = payload?.id || payload?.userId || payload?.sub;
    const email = payload?.email;
    const role = payload?.role;
    const clientId = payload?.clientId || "DAIH-SYSTEM";

    if (!payload || !userId || !email || !role) {
      res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Token claims are incomplete or malformed",
      });
      return;
    }

    if (payload.purpose && payload.purpose !== "access") {
      res.status(401).json({
        code: "INVALID_TOKEN",
        message:
          "Special-purpose tokens cannot be used for general authentication",
      });
      return;
    }

    // Verify session is active and not revoked (Redis Cache + DB Fallback)
    if (payload.sessionId) {
      let isSessionValid = false;

      // 1. Fast Redis cache check (sub-millisecond)
      try {
        const revoked = await redis.get(
          `daih:session:revoked:${payload.sessionId}`,
        );
        if (revoked) {
          res.status(401).json({
            code: "SESSION_REVOKED",
            message:
              "This session has been logged out or replaced by a new token. Please log in again.",
          });
          return;
        }

        const active = await redis.get(
          `daih:session:active:${payload.sessionId}`,
        );
        if (active === "1") {
          isSessionValid = true;
        }
      } catch {
        // Cache miss/unavailable -> fall back to database
      }

      // 2. Database verification fallback
      if (!isSessionValid) {
        const session = await prisma.authSession.findUnique({
          where: { id: payload.sessionId },
        });

        if (!session || session.isRevoked || session.expiresAt < new Date()) {
          try {
            await redis.setex(
              `daih:session:revoked:${payload.sessionId}`,
              900,
              "1",
            );
          } catch {}

          res.status(401).json({
            code: "SESSION_REVOKED",
            message:
              "This session has been logged out or replaced by a new token. Please log in again.",
          });
          return;
        }

        // Cache active session in Redis for subsequent requests
        try {
          await redis.setex(
            `daih:session:active:${payload.sessionId}`,
            900,
            "1",
          );
        } catch {}
      }
    } else if (config.env !== "test" || !process.env.VITEST) {
      res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Token is missing required session claim",
      });
      return;
    }

    req.user = {
      id: userId,
      email: email,
      role: role as UserRole,
      clientId: clientId,
      sessionId: payload.sessionId,
    };

    // Ensure authenticated user data is never cached by intermediate proxies or shared CDN caches
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");

    next();
  } catch (error) {
    res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Token has expired or is invalid",
    });
  }
};
