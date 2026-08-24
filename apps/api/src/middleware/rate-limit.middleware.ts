import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { config } from "../config/env.js";

function createRedisStore(prefix: string) {
  if (
    config.env === "test" ||
    !config.redisUrl ||
    config.redisUrl.includes("********")
  ) {
    return undefined;
  }
  try {
    return new RedisStore({
      // @ts-expect-error - rate-limit-redis / ioredis sendCommand signature
      sendCommand: (...args: string[]) => redis.call(...args),
      prefix: `daih:rl:${prefix}:`,
    });
  } catch (err: any) {
    return undefined;
  }
}

const standardHandler = (_req: Request, res: Response) => {
  res.status(429).json({
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please slow down and try again later.",
  });
};

/**
 * Rate Limiter for Login Endpoint (5 attempts per 15 mins by default)
 */
export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.loginWindowMinutes * 60 * 1000,
  max: config.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("login"),
  keyGenerator: (req: Request) => {
    const email = req.body?.email
      ? String(req.body.email).toLowerCase().trim()
      : "";
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `${ip}:${email}`;
  },
  handler: standardHandler,
  skip: () => config.env === "test", // Skip in automated tests unless explicitly testing rate limits
});

/**
 * Rate Limiter for Registration Endpoint (10 per hour by default)
 */
export const registrationRateLimiter = rateLimit({
  windowMs: config.rateLimit.registerWindowMinutes * 60 * 1000,
  max: config.rateLimit.registerMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("reg"),
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: standardHandler,
  skip: () => config.env === "test",
});

/**
 * Rate Limiter for Verification Resend (3 per hour by default)
 */
export const verificationResendRateLimiter = rateLimit({
  windowMs: config.rateLimit.verifyResendWindowMinutes * 60 * 1000,
  max: config.rateLimit.verifyResendMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("vresend"),
  keyGenerator: (req: Request) => {
    const email = req.body?.email
      ? String(req.body.email).toLowerCase().trim()
      : "";
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `${ip}:${email}`;
  },
  handler: standardHandler,
  skip: () => config.env === "test",
});

/**
 * Rate Limiter for Password Reset Request (3 per hour by default)
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: config.rateLimit.passwordResetWindowMinutes * 60 * 1000,
  max: config.rateLimit.passwordResetMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("pwreset"),
  keyGenerator: (req: Request) => {
    const email = req.body?.email
      ? String(req.body.email).toLowerCase().trim()
      : "";
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `${ip}:${email}`;
  },
  handler: standardHandler,
  skip: () => config.env === "test",
});

/**
 * Rate Limiter for Token Refresh Endpoint (burst protection: 30 per 15 min)
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("refresh"),
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: standardHandler,
  skip: () => config.env === "test",
});
