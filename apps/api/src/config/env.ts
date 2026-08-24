import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load from current working directory
dotenv.config();

// Check if running inside apps/api and load root .env if present
const cwd = process.cwd();
const possibleRootEnv = path.resolve(cwd, "../../.env");
const localEnv = path.resolve(cwd, ".env");

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
}
if (fs.existsSync(possibleRootEnv)) {
  dotenv.config({ path: possibleRootEnv });
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/daih_db?schema=public",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-key-12345678901234567890",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "dev-refresh-secret-12345678901234567890",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_DAYS || "7", 10),
    verificationExpiresInHours: parseInt(
      process.env.VERIFICATION_EXPIRES_HOURS || "24",
      10,
    ),
    passwordResetExpiresInHours: parseInt(
      process.env.PASSWORD_RESET_EXPIRES_HOURS || "1",
      10,
    ),
  },
  cookies: {
    refreshCookieName: "daih_refresh_token",
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none") || "lax",
    path: "/",
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || "admin@daih.ng",
    password: process.env.SUPER_ADMIN_PASSWORD || "SuperAdminPassword123!",
    firstName: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
    lastName: process.env.SUPER_ADMIN_LAST_NAME || "Administrator",
    phoneNumber: process.env.SUPER_ADMIN_PHONE || "07042504389",
  },
  frontendUrls: {
    customer: process.env.FRONTEND_CUSTOMER_URL || "http://localhost:3001",
    admin: process.env.FRONTEND_ADMIN_URL || "http://localhost:3003",
    web: process.env.FRONTEND_WEB_URL || "http://localhost:3000",
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || "auto", // 'auto' | 'resend' | 'zeptomail' | 'mock'
    resendApiKey: process.env.RESEND_API_KEY || "",
    resendFromEmail:
      process.env.RESEND_FROM_EMAIL || "DAIH Hub <noreply@daih.ng>",
    zeptomailApiKey: process.env.ZEPTOMAIL_API_KEY || "",
    zeptomailFromEmail:
      process.env.ZEPTOMAIL_FROM_EMAIL || "DAIH Hub <noreply@daih.ng>",
    zeptomailApiUrl:
      process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email",
  },
  rateLimit: {
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || "5", 10),
    loginWindowMinutes: parseInt(
      process.env.RATE_LIMIT_LOGIN_WINDOW || "15",
      10,
    ),
    registerMax: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || "10", 10),
    registerWindowMinutes: parseInt(
      process.env.RATE_LIMIT_REGISTER_WINDOW || "60",
      10,
    ),
    verifyResendMax: parseInt(process.env.RATE_LIMIT_VERIFY_MAX || "3", 10),
    verifyResendWindowMinutes: parseInt(
      process.env.RATE_LIMIT_VERIFY_WINDOW || "60",
      10,
    ),
    passwordResetMax: parseInt(process.env.RATE_LIMIT_RESET_MAX || "3", 10),
    passwordResetWindowMinutes: parseInt(
      process.env.RATE_LIMIT_RESET_WINDOW || "60",
      10,
    ),
  },
  observability: {
    sentryDsn: process.env.SENTRY_DSN || "",
    ddService: process.env.DD_SERVICE || "daih-api",
    ddEnv: process.env.DD_ENV || process.env.NODE_ENV || "development",
    ddVersion: process.env.DD_VERSION || "1.0.0",
  },
  qrSigningSecret:
    process.env.QR_SIGNING_SECRET || "dev-qr-signing-key-1234567890",
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || "sk_test_mock",
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_test_mock",
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || "wh_sec_mock",
  },
};
