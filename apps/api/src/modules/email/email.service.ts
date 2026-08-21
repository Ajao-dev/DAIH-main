import { IEmailProvider, SendEmailOptions, SendEmailResult } from './email.interface.js';
import { ResendEmailProvider } from './providers/resend.provider.js';
import { ZeptoMailEmailProvider } from './providers/zeptomail.provider.js';
import { MockEmailProvider } from './providers/mock.provider.js';
import { config } from '../../config/env.js';

export class EmailService {
  private primaryProvider: IEmailProvider;
  private fallbackProvider: IEmailProvider;
  private mockProvider: MockEmailProvider;

  constructor() {
    this.primaryProvider = new ResendEmailProvider();
    this.fallbackProvider = new ZeptoMailEmailProvider();
    this.mockProvider = new MockEmailProvider();
  }

  /**
   * Sends email with primary (Resend) -> fallback (ZeptoMail) failover logic.
   * If both fail or in test/dev with no keys, routes to MockProvider safely.
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    // If explicitly set to mock or running in test without keys, use Mock Provider
    if (
      config.email.provider === 'mock' ||
      (!config.email.resendApiKey && !config.email.zeptomailApiKey)
    ) {
      return this.mockProvider.sendEmail(options);
    }

    // 1. Attempt Primary (Resend)
    if (config.email.resendApiKey && config.email.provider !== 'zeptomail') {
      const primaryResult = await this.primaryProvider.sendEmail(options);
      if (primaryResult.success) {
        return primaryResult;
      }
      console.warn(
        `⚠️ Primary email provider (Resend) failed: ${primaryResult.error}. Attempting ZeptoMail fallback...`
      );
    }

    // 2. Attempt Fallback (ZeptoMail)
    if (config.email.zeptomailApiKey) {
      const fallbackResult = await this.fallbackProvider.sendEmail(options);
      if (fallbackResult.success) {
        return fallbackResult;
      }
      console.error(
        `❌ Fallback email provider (ZeptoMail) failed: ${fallbackResult.error}`
      );
    }

    // 3. If in non-production, fallback to mock so flows don't crash
    if (config.env !== 'production') {
      console.warn(
        '⚠️ Both live email providers failed or were unconfigured; falling back to Mock provider in development'
      );
      return this.mockProvider.sendEmail(options);
    }

    return {
      success: false,
      provider: 'none',
      error: 'All email providers failed to deliver message',
    };
  }

  /**
   * Sends Verification Email with branded HTML link
   */
  async sendVerificationEmail(
    to: string,
    name: string,
    rawToken: string
  ): Promise<SendEmailResult> {
    const verifyUrl = `${config.frontendUrls.customer}/verify-email?token=${encodeURIComponent(rawToken)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your DAIH Hub Account</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #1f3a68; padding: 28px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">DAIH Workspace Hub</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Verify Your Email Address</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Welcome to DAIH! Please confirm your email address to activate your account and start booking workspaces, private offices, and conference rooms.
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${verifyUrl}" style="background-color: #d56c04; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">
          Verify Email & Activate Account
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
        This verification link will expire in ${config.jwt.verificationExpiresInHours} hours. If you did not create an account on DAIH, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        Or copy and paste this link into your browser:<br/>
        <span style="color: #1f3a68; word-break: break-all;">${verifyUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: 'Verify your DAIH Hub Account',
      html,
      text: `Hello ${name},\n\nPlease verify your email by clicking: ${verifyUrl}\n\nThis link expires in ${config.jwt.verificationExpiresInHours} hours.`,
    });
  }

  /**
   * Sends Password Reset Email
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    rawToken: string
  ): Promise<SendEmailResult> {
    const resetUrl = `${config.frontendUrls.customer}/reset-password?token=${encodeURIComponent(rawToken)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your DAIH Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #1f3a68; padding: 28px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">DAIH Workspace Hub</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        We received a request to reset the password for your DAIH account. Click the button below to choose a new password.
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #1f3a68; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Your Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
        This password reset link will expire in ${config.jwt.passwordResetExpiresInHours} hour(s). If you did not request a password reset, you can safely ignore this email; your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        Direct link: <span style="color: #1f3a68; word-break: break-all;">${resetUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: 'Reset Your DAIH Password',
      html,
      text: `Hello ${name},\n\nReset your password here: ${resetUrl}\n\nExpires in ${config.jwt.passwordResetExpiresInHours} hour(s).`,
    });
  }

  /**
   * Sends Staff / Admin Account Setup Notice
   */
  async sendStaffWelcomeEmail(
    to: string,
    name: string,
    role: string,
    setupToken?: string
  ): Promise<SendEmailResult> {
    const setupUrl = setupToken
      ? `${config.frontendUrls.admin}/reset-password?token=${encodeURIComponent(setupToken)}`
      : `${config.frontendUrls.admin}/login`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to DAIH Staff Portal</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background-color: #0f1d35; padding: 28px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">DAIH Admin Console</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Staff Account Invitation</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        You have been granted access to the DAIH Operations & Admin Console with the role: <strong>${role}</strong>.
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${setupUrl}" style="background-color: #d56c04; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">
          Access Admin Portal
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: 'Welcome to DAIH Operations & Admin Console',
      html,
      text: `Hello ${name},\n\nYou have been assigned the role ${role} on the DAIH Admin Console. Access: ${setupUrl}`,
    });
  }

  getMockProvider(): MockEmailProvider {
    return this.mockProvider;
  }
}

export const emailService = new EmailService();
