import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../db/client.js';
import { UserRole } from '@daih/types';

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
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Authentication token is missing or invalid',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwt.secret) as any;
    if (!payload || !payload.id || !payload.email || !payload.role || !payload.clientId) {
      res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Token claims are incomplete or malformed',
      });
      return;
    }

    // Verify session is active and not revoked
    if (payload.sessionId) {
      const session = await prisma.authSession.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        res.status(401).json({
          code: 'SESSION_REVOKED',
          message: 'This session has been logged out or replaced by a new token. Please log in again.',
        });
        return;
      }
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role as UserRole,
      clientId: payload.clientId,
      sessionId: payload.sessionId,
    };
    next();
  } catch (error) {
    res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Token has expired or is invalid',
    });
  }
};
