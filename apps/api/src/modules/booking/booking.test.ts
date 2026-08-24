import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { UserRole, BookingState } from "@daih/types";
import jwt from "jsonwebtoken";
import {
  isValidTransition,
  assertValidTransition,
  InvalidBookingStateTransitionError,
} from "./booking.state-machine.js";
import { bookingService } from "./booking.service.js";

describe("Milestone 1.3: Booking Engine & Concurrency Module", () => {
  let adminToken: string;
  let customerToken: string;
  let customer2Token: string;
  let adminUserId: string;
  let customerUserId: string;
  let customer2UserId: string;
  let testResourceId: string;
  let testResourceSlug: string;

  beforeAll(async () => {
    const jwtSecret =
      process.env.JWT_SECRET ||
      "super-secret-jwt-key-change-in-production-min-32-chars";

    // Retry setup for database connections
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const adminUser = await prisma.user.upsert({
          where: { email: "admin.booking@daih.ng" },
          update: { role: UserRole.OPERATIONS_ADMIN, isVerified: true },
          create: {
            email: "admin.booking@daih.ng",
            firstName: "Ops",
            lastName: "Admin",
            clientId: "DAIH-TEST-BKOPS",
            role: UserRole.OPERATIONS_ADMIN,
            isVerified: true,
          },
        });
        adminUserId = adminUser.id;

        const customerUser = await prisma.user.upsert({
          where: { email: "customer.booking1@daih.ng" },
          update: { role: UserRole.CUSTOMER, isVerified: true },
          create: {
            email: "customer.booking1@daih.ng",
            firstName: "Amaka",
            lastName: "Tester",
            clientId: "DAIH-TEST-BKCUST1",
            role: UserRole.CUSTOMER,
            isVerified: true,
          },
        });
        customerUserId = customerUser.id;

        const customerUser2 = await prisma.user.upsert({
          where: { email: "customer.booking2@daih.ng" },
          update: { role: UserRole.CUSTOMER, isVerified: true },
          create: {
            email: "customer.booking2@daih.ng",
            firstName: "Femi",
            lastName: "Concurrent",
            clientId: "DAIH-TEST-BKCUST2",
            role: UserRole.CUSTOMER,
            isVerified: true,
          },
        });
        customer2UserId = customerUser2.id;

        adminToken = jwt.sign(
          {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            clientId: adminUser.clientId,
            emailVerified: true,
          },
          jwtSecret,
          { expiresIn: "1h" },
        );

        customerToken = jwt.sign(
          {
            id: customerUser.id,
            email: customerUser.email,
            role: customerUser.role,
            clientId: customerUser.clientId,
            emailVerified: true,
          },
          jwtSecret,
          { expiresIn: "1h" },
        );

        customer2Token = jwt.sign(
          {
            id: customerUser2.id,
            email: customerUser2.email,
            role: customerUser2.role,
            clientId: customerUser2.clientId,
            emailVerified: true,
          },
          jwtSecret,
          { expiresIn: "1h" },
        );

        // Create a dedicated single-capacity test resource for concurrency tests
        testResourceSlug = `private-suite-test-${Date.now()}`;
        const resource = await prisma.facilityResource.create({
          data: {
            name: "Executive Single Suite Test",
            slug: testResourceSlug,
            category: "OFFICE_SUITE",
            description:
              "Single capacity private executive office for testing.",
            capacity: 1, // Single capacity to test exclusion and race conditions
            location: "2nd Floor, Wing C",
            amenities: ["Fibre WiFi", "Ergonomic Desk", "AC"],
            isActive: true,
            pricing: {
              create: [
                {
                  planName: "Daily Suite Pass",
                  durationDays: 1,
                  price: 15000,
                  currency: "NGN",
                  isActive: true,
                },
              ],
            },
          },
        });
        testResourceId = resource.id;
        break;
      } catch (err) {
        if (attempt === 4) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }, 45000);

  afterAll(async () => {
    try {
      if (testResourceId) {
        await prisma.booking.deleteMany({
          where: { resourceId: testResourceId },
        });
        await prisma.resourcePricing.deleteMany({
          where: { resourceId: testResourceId },
        });
        await prisma.facilityResource.delete({ where: { id: testResourceId } });
      }
    } catch {}
  });

  describe("1. Booking State Machine & Transition Rules", () => {
    it("allows valid state machine transitions", () => {
      expect(isValidTransition(BookingState.DRAFT, BookingState.HELD)).toBe(
        true,
      );
      expect(
        isValidTransition(BookingState.HELD, BookingState.PENDING_PAYMENT),
      ).toBe(true);
      expect(
        isValidTransition(BookingState.PENDING_PAYMENT, BookingState.CONFIRMED),
      ).toBe(true);
      expect(
        isValidTransition(BookingState.CONFIRMED, BookingState.CHECKED_IN),
      ).toBe(true);
      expect(
        isValidTransition(BookingState.CHECKED_IN, BookingState.COMPLETED),
      ).toBe(true);
      expect(isValidTransition(BookingState.HELD, BookingState.EXPIRED)).toBe(
        true,
      );
      expect(
        isValidTransition(BookingState.CONFIRMED, BookingState.CANCELLED),
      ).toBe(true);
    });

    it("rejects forbidden state transitions and throws typed error", () => {
      expect(isValidTransition(BookingState.COMPLETED, BookingState.HELD)).toBe(
        false,
      );
      expect(
        isValidTransition(BookingState.CANCELLED, BookingState.CHECKED_IN),
      ).toBe(false);

      expect(() => {
        assertValidTransition(
          BookingState.COMPLETED,
          BookingState.HELD,
          "bk_123",
        );
      }).toThrow(InvalidBookingStateTransitionError);
    });
  });

  describe("2. Real-Time Availability Engine", () => {
    it("GET /api/v1/bookings/availability returns available for open date range", async () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      const dayAfter = new Date(Date.now() + 172800000).toISOString();

      const res = await request(app)
        .get("/api/v1/bookings/availability")
        .query({
          resourceId: testResourceSlug,
          startTime: tomorrow,
          endTime: dayAfter,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(true);
      expect(res.body.data.capacity).toBe(1);
      expect(res.body.data.remainingSpots).toBe(1);
    }, 30000);

    it("detects scheduled blackout maintenance dates and flags slot unavailable", async () => {
      const blackoutStart = new Date(Date.now() + 300000000);
      const blackoutEnd = new Date(Date.now() + 400000000);

      // Create blackout
      const blackout = await prisma.resourceBlackout.create({
        data: {
          resourceId: testResourceId,
          startDate: blackoutStart,
          endDate: blackoutEnd,
          reason: "Emergency AC Overhaul",
          isActive: true,
        },
      });

      const res = await request(app)
        .get("/api/v1/bookings/availability")
        .query({
          resourceId: testResourceId,
          startTime: new Date(blackoutStart.getTime() + 1000).toISOString(),
          endTime: new Date(blackoutEnd.getTime() - 1000).toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(false);
      expect(res.body.data.reason).toContain("maintenance");

      // Cleanup blackout
      await prisma.resourceBlackout.delete({ where: { id: blackout.id } });
    }, 20000);
  });

  describe("3. 10-Minute Hold Engine & Expiry", () => {
    let createdHoldId: string;

    it("POST /api/v1/bookings/hold creates a 10-minute hold with reference and total amount", async () => {
      const start = new Date(Date.now() + 500000000).toISOString();
      const end = new Date(Date.now() + 586400000).toISOString();

      const res = await request(app)
        .post("/api/v1/bookings/hold")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resourceId: testResourceSlug,
          startTime: start,
          endTime: end,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toMatch(/^DAIH-BK-/);
      expect(res.body.data.state).toBe("HELD");
      expect(res.body.data.totalAmount).toBe(15000);
      expect(res.body.data.holdExpiresAt).toBeDefined();

      createdHoldId = res.body.data.bookingId;
    }, 20000);

    it("POST /api/v1/bookings/:id/extend-hold extends the expiration timestamp", async () => {
      expect(createdHoldId).toBeDefined();
      const res = await request(app)
        .post(`/api/v1/bookings/${createdHoldId}/extend-hold`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.holdExpiresAt).toBeDefined();
    }, 20000);

    it("expires hold and frees inventory when timer expires", async () => {
      expect(createdHoldId).toBeDefined();
      // Artificially set holdExpiresAt in the past
      await prisma.booking.update({
        where: { id: createdHoldId },
        data: { holdExpiresAt: new Date(Date.now() - 5000) },
      });

      // Run expiry processor
      await bookingService.expireHold(createdHoldId);

      const updated = await prisma.booking.findUnique({
        where: { id: createdHoldId },
      });
      expect(updated?.state).toBe(BookingState.EXPIRED);

      // Cleanup
      await prisma.booking.delete({ where: { id: createdHoldId } });
    }, 20000);
  });

  describe("4. Concurrency Test Suite (Zero Double-Bookings Proof)", () => {
    it("handles 10 simultaneous booking attempts on single-capacity slot: exactly 1 wins, 9 fail with 409", async () => {
      const slotStart = new Date(Date.now() + 700000000).toISOString();
      const slotEnd = new Date(Date.now() + 786400000).toISOString();

      // Launch 10 simultaneous concurrent requests trying to claim the same resource & time slot
      const attempts = Array.from({ length: 10 }).map((_, idx) =>
        request(app)
          .post("/api/v1/bookings/hold")
          .set(
            "Authorization",
            `Bearer ${idx % 2 === 0 ? customerToken : customer2Token}`,
          )
          .send({
            resourceId: testResourceId,
            startTime: slotStart,
            endTime: slotEnd,
          }),
      );

      const results = await Promise.all(attempts);

      const successful = results.filter((r) => r.status === 201);
      const conflicts = results.filter((r) => r.status === 409);

      // Exactly 1 must succeed
      expect(successful.length).toBe(1);
      expect(successful[0].body.data.bookingId).toBeDefined();

      // The other 9 must receive 409 conflict
      expect(conflicts.length).toBe(9);
      expect(conflicts[0].body.code).toBe("SLOT_UNAVAILABLE");

      // Verify in DB that only 1 booking was created
      const dbBookings = await prisma.booking.findMany({
        where: {
          resourceId: testResourceId,
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
          state: BookingState.HELD,
        },
      });

      expect(dbBookings.length).toBe(1);

      // Cleanup winning booking
      await prisma.booking.deleteMany({
        where: { resourceId: testResourceId },
      });
    }, 35000);
  });

  describe("5. Operations Admin Overrides & Audit Log", () => {
    it("allows Operations Admin to force-reserve a slot with mandatory reason logged to AuditLog", async () => {
      const overrideStart = new Date(Date.now() + 900000000).toISOString();
      const overrideEnd = new Date(Date.now() + 986400000).toISOString();
      const reason = "VIP Dignitary Visit Reservation approved by Director";

      const res = await request(app)
        .post("/api/v1/bookings/admin/override")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          resourceId: testResourceId,
          customerEmail: "customer.booking1@daih.ng",
          startTime: overrideStart,
          endTime: overrideEnd,
          state: "CONFIRMED",
          overrideReason: reason,
          waiveFee: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toMatch(/^DAIH-OVR-/);
      expect(res.body.data.state).toBe("CONFIRMED");
      expect(res.body.data.amount).toBe(0);

      const overrideBookingId = res.body.data.id;

      // Verify AuditLog entry was recorded
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          action: "BOOKING_ADMIN_OVERRIDE",
          entityId: overrideBookingId,
        },
      });

      expect(auditEntry).toBeDefined();
      expect((auditEntry?.metadata as any)?.overrideReason).toBe(reason);

      // Cleanup
      await prisma.booking.delete({ where: { id: overrideBookingId } });
    }, 20000);

    it("rejects admin override if reason is omitted or too short", async () => {
      const res = await request(app)
        .post("/api/v1/bookings/admin/override")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          resourceId: testResourceId,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
          overrideReason: "Hi", // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    }, 15000);
  });
});
