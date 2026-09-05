import { describe, it, expect } from "vitest";
import {
  maskIpAddress,
  hashUserAgent,
  computeFingerprint,
} from "./fingerprint.js";

describe("Device Fingerprint Utility", () => {
  describe("maskIpAddress", () => {
    it("masks standard IPv4 addresses to /24 subnet", () => {
      expect(maskIpAddress("192.168.1.45")).toBe("192.168.1.0");
      expect(maskIpAddress("10.20.30.125")).toBe("10.20.30.0");
      expect(maskIpAddress("172.16.5.99")).toBe("172.16.5.0");
    });

    it("strips port numbers from IPv4 addresses", () => {
      expect(maskIpAddress("192.168.1.45:54321")).toBe("192.168.1.0");
    });

    it("masks standard IPv6 addresses to /64 prefix", () => {
      const v6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      expect(maskIpAddress(v6)).toBe("2001:db8:85a3::");
    });

    it("handles IPv4-mapped IPv6 addresses (::ffff:192.168.1.100)", () => {
      expect(maskIpAddress("::ffff:192.168.1.100")).toBe("192.168.1.0");
    });

    it("handles localhost addresses safely", () => {
      expect(maskIpAddress("127.0.0.1")).toBe("127.0.0.0");
      expect(maskIpAddress("::1")).toBe("127.0.0.0");
    });

    it("falls back to 0.0.0.0 on malformed or empty inputs", () => {
      expect(maskIpAddress("")).toBe("0.0.0.0");
      expect(maskIpAddress(null as any)).toBe("0.0.0.0");
      expect(maskIpAddress("invalid-ip-string")).toBe("0.0.0.0");
    });
  });

  describe("hashUserAgent", () => {
    it("produces deterministic SHA-256 hash regardless of whitespace or casing", () => {
      const ua1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
      const ua2 = "   mozilla/5.0 (windows nt 10.0; win64; x64)   ";
      expect(hashUserAgent(ua1)).toBe(hashUserAgent(ua2));
    });

    it("produces different hashes for different user agents", () => {
      const ua1 = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)";
      const ua2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
      expect(hashUserAgent(ua1)).not.toBe(hashUserAgent(ua2));
    });
  });

  describe("computeFingerprint", () => {
    it("produces identical fingerprints for requests on the same /24 subnet and user agent", () => {
      const mockReq1: any = {
        ip: "192.168.1.20",
        headers: { "user-agent": "Chrome/120.0" },
      };
      const mockReq2: any = {
        ip: "192.168.1.99", // Same /24 subnet
        headers: { "user-agent": "Chrome/120.0" },
      };

      expect(computeFingerprint(mockReq1)).toBe(computeFingerprint(mockReq2));
    });

    it("produces different fingerprints when subnets differ", () => {
      const mockReq1: any = {
        ip: "192.168.1.20",
        headers: { "user-agent": "Chrome/120.0" },
      };
      const mockReq2: any = {
        ip: "192.168.2.20", // Different /24 subnet
        headers: { "user-agent": "Chrome/120.0" },
      };

      expect(computeFingerprint(mockReq1)).not.toBe(
        computeFingerprint(mockReq2),
      );
    });

    it("produces different fingerprints when user agents differ", () => {
      const mockReq1: any = {
        ip: "192.168.1.20",
        headers: { "user-agent": "Chrome/120.0" },
      };
      const mockReq2: any = {
        ip: "192.168.1.20",
        headers: { "user-agent": "Firefox/120.0" },
      };

      expect(computeFingerprint(mockReq1)).not.toBe(
        computeFingerprint(mockReq2),
      );
    });
  });
});
