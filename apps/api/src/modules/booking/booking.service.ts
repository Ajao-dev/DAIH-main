import { bookingRepository, BookingRepository } from './booking.repository.js';
import {
  CheckAvailabilityInput,
  CalendarAvailabilityInput,
  CreateHoldInput,
  AdminOverrideBookingInput,
  BookingFilterInput,
} from './booking.schema.js';
import {
  assertValidTransition,
  InvalidBookingStateTransitionError,
  ACTIVE_BOOKING_STATES,
} from './booking.state-machine.js';
import { prisma } from '../../db/client.js';
import { outboxService } from '../events/outbox.service.js';
import { scheduleHoldExpiry, cancelHoldExpiryJob } from '../../jobs/hold-expiry.job.js';
import { BookingState, CalendarDayStatus } from '@daih/types';

export class BookingService {
  constructor(private repo: BookingRepository = bookingRepository) {}

  /**
   * Format booking summary for API responses
   */
  private formatBookingSummary(booking: any) {
    if (!booking) return null;

    const isConfirmedOrActive = [
      BookingState.CONFIRMED,
      BookingState.ACTIVE,
      BookingState.CHECKED_IN,
      BookingState.COMPLETED,
    ].includes(booking.state as BookingState);

    return {
      id: booking.id,
      reference: booking.reference,
      resourceId: booking.resourceId,
      resourceName: booking.resource?.name || 'Selected Space',
      category: booking.resource?.category || 'FLEX_DESK',
      userId: booking.userId,
      customerName: booking.user
        ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() || booking.user.email
        : 'Customer',
      customerEmail: booking.user?.email,
      customerPhone: booking.user?.phoneNumber || undefined,
      startTime: booking.startTime instanceof Date ? booking.startTime.toISOString() : booking.startTime,
      endTime: booking.endTime instanceof Date ? booking.endTime.toISOString() : booking.endTime,
      state: booking.state,
      qrToken: isConfirmedOrActive ? (booking.qrToken || undefined) : undefined,
      amount: Number(booking.totalAmount),
      currency: booking.currency || 'NGN',
      holdExpiresAt: booking.holdExpiresAt
        ? (booking.holdExpiresAt instanceof Date ? booking.holdExpiresAt.toISOString() : booking.holdExpiresAt)
        : null,
      createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
      updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
    };
  }

  /**
   * Real-time availability check taking into account:
   * - Resource active status
   * - Scheduled blackout / maintenance dates
   * - Day-of-week operating hours
   * - Active holds and confirmed bookings vs total resource capacity
   */
  async checkAvailability(input: CheckAvailabilityInput) {
    const resource = await this.repo.findResource(input.resourceId);
    if (!resource || !resource.isActive) {
      return {
        available: false,
        resourceId: input.resourceId,
        resourceName: resource?.name || 'Workspace',
        category: resource?.category || ('FLEX_DESK' as any),
        capacity: 0,
        activeCount: 0,
        remainingSpots: 0,
        startTime: input.startTime,
        endTime: input.endTime,
        reason: 'Workspace is currently offline or inactive',
      };
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    // 1. Blackout date check
    const isBlackedOut = (resource.blackouts || []).some((b) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return b.isActive && start < bEnd && end > bStart;
    });

    if (isBlackedOut) {
      return {
        available: false,
        resourceId: resource.id,
        resourceName: resource.name,
        category: resource.category,
        capacity: resource.capacity,
        activeCount: resource.capacity,
        remainingSpots: 0,
        startTime: input.startTime,
        endTime: input.endTime,
        reason: 'Workspace is unavailable due to scheduled maintenance or a private blackout',
      };
    }

    // 2. Day-of-week operating hours check
    const dayOfWeek = start.getDay();
    const schedule = (resource.schedules || []).find((s) => s.dayOfWeek === dayOfWeek);
    if (schedule && schedule.isClosed) {
      return {
        available: false,
        resourceId: resource.id,
        resourceName: resource.name,
        category: resource.category,
        capacity: resource.capacity,
        activeCount: resource.capacity,
        remainingSpots: 0,
        startTime: input.startTime,
        endTime: input.endTime,
        reason: 'Workspace is closed on this day of the week',
      };
    }

    // 3. Count active overlapping bookings / holds
    const activeCount = await this.repo.countActiveOverlappingBookings(
      prisma,
      resource.id,
      start,
      end
    );

    const remainingSpots = Math.max(0, resource.capacity - activeCount);
    const available = remainingSpots > 0;

    return {
      available,
      resourceId: resource.id,
      resourceName: resource.name,
      category: resource.category,
      capacity: resource.capacity,
      activeCount,
      remainingSpots,
      startTime: input.startTime,
      endTime: input.endTime,
      reason: available ? undefined : 'All available slots for this workspace are currently reserved',
    };
  }

  /**
   * Get sparse monthly calendar availability map (exceptions only)
   */
  async getCalendarAvailability(input: CalendarAvailabilityInput) {
    const resource = await this.repo.findResource(input.resourceId);
    if (!resource || !resource.isActive) {
      const error: any = new Error(`Resource '${input.resourceId}' is not active or found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    const now = new Date();
    const targetMonth = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed month

    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

    // Fetch active bookings in month range
    const bookings = await prisma.booking.findMany({
      where: {
        resourceId: resource.id,
        state: { in: ACTIVE_BOOKING_STATES },
        startTime: { lt: endOfMonth },
        endTime: { gt: startOfMonth },
        OR: [
          { holdExpiresAt: null },
          { holdExpiresAt: { gt: now } },
        ],
      },
      select: { startTime: true, endTime: true },
    });

    const busyDates: Record<string, any> = {};

    // 1. Process blackouts
    (resource.blackouts || []).forEach((b) => {
      if (!b.isActive) return;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);

      const cur = new Date(Math.max(bStart.getTime(), startOfMonth.getTime()));
      const limit = new Date(Math.min(bEnd.getTime(), endOfMonth.getTime()));

      while (cur <= limit) {
        const dStr = cur.toISOString().split('T')[0];
        busyDates[dStr] = {
          status: CalendarDayStatus.BLACKOUT,
          reason: b.reason || 'Scheduled Maintenance',
        };
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    });

    // 2. Process closed days of week
    const closedDaysOfWeek = (resource.schedules || [])
      .filter((s) => s.isClosed)
      .map((s) => s.dayOfWeek);

    if (closedDaysOfWeek.length > 0) {
      const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInTargetMonth; d++) {
        const dayTwoDigits = String(d).padStart(2, '0');
        const monthTwoDigits = String(month + 1).padStart(2, '0');
        const dStr = `${year}-${monthTwoDigits}-${dayTwoDigits}`;
        const noonDate = new Date(`${dStr}T12:00:00.000Z`);
        const dayOfWeek = noonDate.getUTCDay();

        if (closedDaysOfWeek.includes(dayOfWeek)) {
          if (!busyDates[dStr]) {
            busyDates[dStr] = {
              status: CalendarDayStatus.CLOSED,
              reason: 'Workspace is closed on this day',
            };
          }
        }
      }
    }

    // 3. Process bookings into date slots & hour slots
    const dateBookingsMap: Record<string, { start: Date; end: Date }[]> = {};

    bookings.forEach((bk) => {
      const bStart = bk.startTime instanceof Date ? bk.startTime : new Date(bk.startTime);
      const bEnd = bk.endTime instanceof Date ? bk.endTime : new Date(bk.endTime);

      const cur = new Date(Math.max(bStart.getTime(), startOfMonth.getTime()));
      while (cur < bEnd && cur <= endOfMonth) {
        const dStr = cur.toISOString().split('T')[0];
        if (!dateBookingsMap[dStr]) dateBookingsMap[dStr] = [];
        dateBookingsMap[dStr].push({ start: bStart, end: bEnd });
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    });

    Object.entries(dateBookingsMap).forEach(([dStr, list]) => {
      // If already blackout or closed, keep existing status
      if (busyDates[dStr] && [CalendarDayStatus.BLACKOUT, CalendarDayStatus.CLOSED].includes(busyDates[dStr].status)) {
        return;
      }

      // Calculate max simultaneous overlap on this day
      let maxSimultaneous = list.length;
      const remainingSpots = Math.max(0, resource.capacity - maxSimultaneous);

      // Collect hour slots (0..23) that are booked on this day
      const bookedHours = new Set<number>();
      list.forEach((b) => {
        for (let h = 0; h < 24; h++) {
          const slotStart = new Date(`${dStr}T${String(h).padStart(2, '0')}:00:00.000Z`);
          const slotEnd = new Date(`${dStr}T${String(h).padStart(2, '0')}:59:59.999Z`);
          if (b.start < slotEnd && b.end > slotStart) {
            bookedHours.add(h);
          }
        }
      });

      const status = remainingSpots <= 0 ? CalendarDayStatus.FULL : CalendarDayStatus.LIMITED;

      busyDates[dStr] = {
        status,
        remainingSpots,
        bookedHourSlots: Array.from(bookedHours).sort((a, b) => a - b),
      };
    });

    return {
      resourceId: resource.id,
      resourceName: resource.name,
      capacity: resource.capacity,
      month: targetMonth,
      defaultStatus: CalendarDayStatus.AVAILABLE,
      busyDates,
    };
  }

  /**
   * Create a 10-minute hold on a resource with concurrency lock
   */
  async createHold(userId: string, input: CreateHoldInput) {
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    try {
      // Perform check and hold insertion inside an interactive transaction with row-level lock
      const booking = await prisma.$transaction(
        async (tx) => {
          const resource = await tx.facilityResource.findFirst({
            where: {
              OR: [{ id: input.resourceId }, { slug: input.resourceId }],
            },
            include: {
              pricing: { where: { isActive: true } },
              blackouts: { where: { isActive: true } },
              schedules: true,
            },
          });

          if (!resource || !resource.isActive) {
            const error: any = new Error(`Workspace resource '${input.resourceId}' is inactive or not found`);
            error.statusCode = 404;
            error.code = 'RESOURCE_NOT_FOUND';
            throw error;
          }

          // Lock resource row in DB to serialize concurrency checks for this resource
          await tx.$queryRaw`SELECT id FROM "facility_resources" WHERE id = ${resource.id} FOR UPDATE`;

          // Check blackouts
          const isBlackedOut = (resource.blackouts || []).some((b) => {
            return b.isActive && start < new Date(b.endDate) && end > new Date(b.startDate);
          });
          if (isBlackedOut) {
            const error: any = new Error('Workspace is unavailable due to scheduled maintenance');
            error.statusCode = 409;
            error.code = 'SLOT_UNAVAILABLE';
            throw error;
          }

          // Check overlapping active reservations vs capacity
          const activeCount = await this.repo.countActiveOverlappingBookings(
            tx,
            resource.id,
            start,
            end
          );

          if (activeCount >= resource.capacity) {
            const error: any = new Error('Workspace capacity is fully reserved for the selected time range');
            error.statusCode = 409;
            error.code = 'SLOT_UNAVAILABLE';
            throw error;
          }

          // Calculate price
          let calculatedPrice = 4000;
          let currency = 'NGN';

          if (input.planId) {
            const plan = resource.pricing.find((p) => p.id === input.planId);
            if (plan) {
              calculatedPrice = Number(plan.price);
              currency = plan.currency;
            }
          } else if (resource.pricing.length > 0) {
            calculatedPrice = Number(resource.pricing[0].price);
            currency = resource.pricing[0].currency;
          }

          const now = new Date();
          const holdExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes hold
          const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
          const randomSuffix = Math.floor(10000 + Math.random() * 90000);
          const reference = `DAIH-BK-${datePart}-${randomSuffix}`;

          const created = await this.repo.createHold(tx, {
            reference,
            resourceId: resource.id,
            userId,
            startTime: start,
            endTime: end,
            totalAmount: calculatedPrice,
            currency,
            holdExpiresAt,
          });

          return created;
        },
        {
          maxWait: 15000,
          timeout: 20000,
        }
      );

      // Schedule BullMQ delayed hold expiration job
      await scheduleHoldExpiry(booking.id, 10 * 60 * 1000);

      // Record outbox event
      await outboxService.recordEvent({
        eventType: 'booking.hold_created',
        aggregateType: 'Booking',
        aggregateId: booking.id,
        payload: {
          bookingId: booking.id,
          reference: booking.reference,
          resourceId: booking.resourceId,
          userId,
          holdExpiresAt: booking.holdExpiresAt,
        },
      });

      return {
        bookingId: booking.id,
        reference: booking.reference,
        resourceId: booking.resourceId,
        resourceName: booking.resource?.name,
        userId: booking.userId,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        holdExpiresAt: booking.holdExpiresAt?.toISOString() || new Date().toISOString(),
        totalAmount: Number(booking.totalAmount),
        currency: booking.currency,
        state: booking.state,
      };
    } catch (err: any) {
      if (
        err.statusCode === 409 ||
        err.code === 'SLOT_UNAVAILABLE' ||
        err.code === 'P2002' ||
        /exclusion|no_overlapping_active_bookings|23P01|duplicate/i.test(err.message || '')
      ) {
        const conflictError: any = new Error('Workspace capacity is fully reserved for the selected time range');
        conflictError.statusCode = 409;
        conflictError.code = 'SLOT_UNAVAILABLE';
        throw conflictError;
      }
      throw err;
    }
  }

  /**
   * Extend hold expiry (e.g. when user clicks Complete Checkout and initiates payment)
   */
  async extendHold(bookingId: string, userId: string, extraMinutes: number = 10) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      const error: any = new Error(`Booking '${bookingId}' not found`);
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    if (booking.userId !== userId) {
      const error: any = new Error('You are not authorized to modify this booking');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (booking.state !== BookingState.HELD && booking.state !== BookingState.PENDING_PAYMENT) {
      const error: any = new Error(`Cannot extend hold for booking in state '${booking.state}'`);
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATE';
      throw error;
    }

    const newExpiry = new Date(Date.now() + extraMinutes * 60 * 1000);
    const updated = await this.repo.extendHold(prisma, bookingId, newExpiry);

    // Reschedule delayed expiry job
    await scheduleHoldExpiry(bookingId, extraMinutes * 60 * 1000);

    return {
      success: true,
      bookingId: updated.id,
      holdExpiresAt: updated.holdExpiresAt?.toISOString() || newExpiry.toISOString(),
    };
  }

  /**
   * Automatically expires a hold if payment is not completed
   */
  async expireHold(bookingId: string) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) return;

    if (booking.state === BookingState.HELD || booking.state === BookingState.PENDING_PAYMENT) {
      if (booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= new Date()) {
        assertValidTransition(booking.state as BookingState, BookingState.EXPIRED, booking.id);
        await this.repo.updateState(prisma, booking.id, BookingState.EXPIRED);

        console.log(`⏰ Booking hold expired for '${booking.reference}' (${booking.id})`);

        await outboxService.recordEvent({
          eventType: 'booking.hold_expired',
          aggregateType: 'Booking',
          aggregateId: booking.id,
          payload: { bookingId: booking.id, reference: booking.reference, resourceId: booking.resourceId },
        });
      }
    }
  }

  /**
   * Cancel an active booking or hold
   */
  async cancelBooking(bookingId: string, userId: string, reason?: string, actorRole?: string) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      const error: any = new Error(`Booking '${bookingId}' not found`);
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    // Permission check
    const isOwner = booking.userId === userId;
    const isStaff = actorRole && ['OPERATIONS_ADMIN', 'SUPER_ADMIN'].includes(actorRole);
    if (!isOwner && !isStaff) {
      const error: any = new Error('You are not authorized to cancel this booking');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    assertValidTransition(booking.state as BookingState, BookingState.CANCELLED, booking.id);

    const updated = await this.repo.updateState(prisma, bookingId, BookingState.CANCELLED);
    await cancelHoldExpiryJob(bookingId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: bookingId,
        metadata: { reference: booking.reference, previousState: booking.state, reason },
      },
    });

    // Outbox event
    await outboxService.recordEvent({
      eventType: 'booking.cancelled',
      aggregateType: 'Booking',
      aggregateId: bookingId,
      payload: { bookingId, reference: booking.reference, reason },
    });

    return this.formatBookingSummary(updated);
  }

  /**
   * Confirm booking (e.g. upon payment confirmation or admin approval)
   */
  async confirmBooking(bookingId: string) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      const error: any = new Error(`Booking '${bookingId}' not found`);
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    if (booking.state === BookingState.EXPIRED) {
      // Check if capacity is still available for this time range before late recovery
      const resource = await this.repo.findResource(booking.resourceId);
      if (resource) {
        const activeCount = await this.repo.countActiveOverlappingBookings(
          prisma,
          booking.resourceId,
          booking.startTime,
          booking.endTime,
          booking.id
        );
        if (activeCount >= resource.capacity) {
          await this.repo.updateState(prisma, bookingId, BookingState.CANCELLED);
          const error: any = new Error(`Cannot confirm payment for expired booking '${booking.reference}': space is fully booked.`);
          error.statusCode = 409;
          error.code = 'SLOT_UNAVAILABLE';
          throw error;
        }
      }
    }

    assertValidTransition(booking.state as BookingState, BookingState.CONFIRMED, booking.id);

    const qrToken = `daih_qr_${booking.id}_${Date.now()}`;
    const updated = await this.repo.updateState(prisma, bookingId, BookingState.CONFIRMED, {
      qrToken,
      holdExpiresAt: null,
    });

    await cancelHoldExpiryJob(bookingId);

    await outboxService.recordEvent({
      eventType: 'booking.confirmed',
      aggregateType: 'Booking',
      aggregateId: bookingId,
      payload: { bookingId, reference: booking.reference, qrToken },
    });

    return this.formatBookingSummary(updated);
  }

  /**
   * Find booking by ID
   */
  async getBookingById(bookingId: string) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) return null;
    return this.formatBookingSummary(booking);
  }

  /**
   * Get customer's own bookings
   */
  async getMyBookings(userId: string) {
    const bookings = await this.repo.findMyBookings(userId);
    return bookings.map((b) => this.formatBookingSummary(b));
  }

  /**
   * Get all bookings for Operations Admin console
   */
  async getAdminBookings(filters: BookingFilterInput) {
    const res = await this.repo.findAllAdminBookings({
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    return {
      total: res.total,
      page: res.page,
      limit: res.limit,
      bookings: res.bookings.map((b) => this.formatBookingSummary(b)),
    };
  }

  /**
   * Operations Admin Manual Override / Force Reservation
   * Mandatory overrideReason is logged to AuditLog
   */
  async adminOverride(adminUserId: string, input: AdminOverrideBookingInput, ipAddress?: string) {
    const resource = await this.repo.findResource(input.resourceId);
    if (!resource) {
      const error: any = new Error(`Workspace resource '${input.resourceId}' not found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    let targetUserId = input.userId;
    if (!targetUserId && input.customerEmail) {
      const user = await prisma.user.findUnique({ where: { email: input.customerEmail } });
      targetUserId = user ? user.id : adminUserId;
    }
    if (!targetUserId) {
      targetUserId = adminUserId;
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const reference = `DAIH-OVR-${datePart}-${randomSuffix}`;
    const targetState = input.state || BookingState.CONFIRMED;

    const booking = await prisma.booking.create({
      data: {
        reference,
        resourceId: resource.id,
        userId: targetUserId,
        startTime: start,
        endTime: end,
        state: targetState as any,
        totalAmount: input.waiveFee ? 0 : input.totalAmount || 0,
        currency: input.currency || 'NGN',
        qrToken: targetState === BookingState.CONFIRMED ? `daih_qr_${Date.now()}` : null,
      },
      include: {
        resource: true,
        user: true,
      },
    });

    // Mandatory AuditLog entry
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'BOOKING_ADMIN_OVERRIDE',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: {
          reference: booking.reference,
          resourceId: resource.id,
          resourceName: resource.name,
          targetUserId,
          overrideReason: input.overrideReason,
          state: targetState,
          waivedFee: Boolean(input.waiveFee),
        },
        ipAddress,
      },
    });

    // Outbox event
    await outboxService.recordEvent({
      eventType: 'booking.admin_overridden',
      aggregateType: 'Booking',
      aggregateId: booking.id,
      payload: {
        bookingId: booking.id,
        reference: booking.reference,
        adminUserId,
        overrideReason: input.overrideReason,
      },
    });

    return this.formatBookingSummary(booking);
  }
}

export const bookingService = new BookingService();
