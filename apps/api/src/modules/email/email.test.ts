import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./email.service.js";
import { config } from "../../config/env.js";

describe("EmailService & Provider Failover", () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService();
  });

  it("should send email using mock provider in development/test environment", async () => {
    const result = await emailService.sendEmail({
      to: "member@daih.ng",
      subject: "Test Subject",
      html: "<p>Test Message</p>",
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe("MockProvider");
    expect(emailService.getMockProvider().sentEmails.length).toBe(1);
    expect(emailService.getMockProvider().sentEmails[0].subject).toBe(
      "Test Subject",
    );
  });

  it("should generate properly formatted verification email with token link", async () => {
    emailService.getMockProvider().clear();

    const result = await emailService.sendVerificationEmail(
      "tunde@company.com",
      "Tunde Adeleke",
      "secure_verification_token_123",
    );

    expect(result.success).toBe(true);
    const sent = emailService.getMockProvider().sentEmails[0];
    expect(sent.to).toBe("tunde@company.com");
    expect(sent.subject).toContain("Verify your DAIH Hub Account");
    expect(sent.html).toContain("secure_verification_token_123");
    expect(sent.html).toContain("/verify-email?token=");
  });

  it("should generate properly formatted password reset email with token link", async () => {
    emailService.getMockProvider().clear();

    const result = await emailService.sendPasswordResetEmail(
      "amina@company.com",
      "Amina Bello",
      "secure_reset_token_456",
    );

    expect(result.success).toBe(true);
    const sent = emailService.getMockProvider().sentEmails[0];
    expect(sent.to).toBe("amina@company.com");
    expect(sent.subject).toContain("Reset Your DAIH Password");
    expect(sent.html).toContain("secure_reset_token_456");
    expect(sent.html).toContain("/reset-password?token=");
  });

  it("should generate properly formatted staff welcome notice", async () => {
    emailService.getMockProvider().clear();

    const result = await emailService.sendStaffWelcomeEmail(
      "admin.staff@daih.ng",
      "Staff User",
      "OPERATIONS_ADMIN",
    );

    expect(result.success).toBe(true);
    const sent = emailService.getMockProvider().sentEmails[0];
    expect(sent.to).toBe("admin.staff@daih.ng");
    expect(sent.subject).toContain("Welcome to DAIH");
    expect(sent.html).toContain("OPERATIONS_ADMIN");
  });
});
