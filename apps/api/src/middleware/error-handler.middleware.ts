import { Request, Response, NextFunction } from 'express';
import { sanitizeMessage, sanitizeStack, sanitizeObject, safeLogger } from '../utils/sanitizer.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const rawCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const code = sanitizeMessage(rawCode);
  const rawMessage = err.message || 'An unexpected error occurred';

  // Identify database / connection / infrastructure failure signatures
  const isDbOrInternalError =
    statusCode >= 500 ||
    /prisma|database|connection|econnrefused|etimedout|pooler|neon|postgres|pg_/i.test(
      `${err.name || ''} ${rawMessage} ${err.stack || ''}`
    );

  // 1. Sanitize backend server logging (Zero-Leakage Guarantee)
  if (process.env.NODE_ENV !== 'test') {
    const safeMsg = sanitizeMessage(rawMessage);
    const safeStk = sanitizeStack(err.stack);
    safeLogger.error(`[API Error] [${code}] ${safeMsg}`, safeStk || '');
  }

  // 2. Format client-facing response
  // 5xx errors & DB errors MUST return generic, safe messages to the client
  let clientMessage: string;
  let clientDetails: any = undefined;

  if (isDbOrInternalError) {
    clientMessage = 'Service temporarily unavailable. Please try again shortly.';
  } else {
    clientMessage = sanitizeMessage(rawMessage);
    if (err.details) {
      clientDetails = sanitizeObject(err.details);
    }
  }

  res.status(statusCode >= 500 || isDbOrInternalError ? (statusCode >= 500 ? statusCode : 500) : statusCode).json({
    success: false,
    code: isDbOrInternalError ? 'INTERNAL_SERVER_ERROR' : code,
    message: clientMessage,
    ...(clientDetails ? { details: clientDetails } : {}),
  });
};