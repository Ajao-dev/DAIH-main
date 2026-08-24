import { prisma } from "../../db/client.js";
import {
  UserRole,
  CustomerFilterDTO,
  CustomerListResponse,
  CustomerRecord,
  CustomerMetrics,
  CreateCustomerDTO,
} from "@daih/types";
import { clientIdService } from "./client-id.service.js";
import { passwordService } from "./password.service.js";

export class CustomerService {
  /**
   * Fetches paginated customers with search, status filters, and live aggregated metrics.
   */
  async getCustomers(
    filter: CustomerFilterDTO = {},
  ): Promise<CustomerListResponse> {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      role: UserRole.CUSTOMER,
    };

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim();
      whereClause.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { clientId: { contains: q, mode: "insensitive" } },
        { phoneNumber: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filter.status && filter.status !== "ALL") {
      const st = filter.status.toUpperCase();
      if (st === "ACTIVE") {
        whereClause.isVerified = true;
      } else if (st === "PENDING") {
        whereClause.isVerified = false;
      }
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [
      users,
      total,
      totalCount,
      activeCount,
      newThisMonthCount,
      completedBookings,
    ] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          bookings: {
            orderBy: { startTime: "desc" },
            take: 1,
            include: {
              resource: {
                select: { name: true, category: true },
              },
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.user.count({
        where: { role: UserRole.CUSTOMER, isVerified: true },
      }),
      prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.booking.findMany({
        where: {
          state: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
        },
        select: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevSum = completedBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0,
    );
    const formattedRev =
      totalRevSum >= 1000000
        ? `₦${(totalRevSum / 1000000).toFixed(1)}M`
        : totalRevSum >= 1000
          ? `₦${(totalRevSum / 1000).toFixed(1)}k`
          : `₦${totalRevSum.toLocaleString()}`;

    const metrics: CustomerMetrics = {
      totalMembers: totalCount,
      activeNow: activeCount,
      newThisMonth: newThisMonthCount,
      mrrGrowth: formattedRev,
    };

    const customers: CustomerRecord[] = users.map((u) => {
      const latestBooking = u.bookings?.[0];
      let tier = "Dedicated Desk";
      if (latestBooking?.resource) {
        tier = latestBooking.resource.name;
      }

      let lastVisit = "No visits yet";
      if (latestBooking) {
        lastVisit = new Date(latestBooking.startTime).toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        );
      }

      const status: "Active" | "Pending" | "Inactive" = u.isVerified
        ? "Active"
        : "Pending";

      return {
        id: u.clientId,
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phoneNumber ?? undefined,
        tier,
        status,
        lastVisit,
        joinedDate: new Date(u.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        totalBookings: u._count.bookings,
        totalSpent: 0,
        isVerified: u.isVerified,
        createdAt: u.createdAt.toISOString(),
      };
    });

    return {
      customers,
      total,
      page,
      limit,
      metrics,
    };
  }

  /**
   * Creates a new customer from the admin console and returns the record.
   */
  async createCustomer(dto: CreateCustomerDTO): Promise<CustomerRecord> {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      const error: any = new Error("An account with this email already exists");
      error.code = "EMAIL_ALREADY_EXISTS";
      error.statusCode = 409;
      throw error;
    }

    const clientId = await clientIdService.generateNextClientId();
    const tempPassword = passwordService.generateSecureToken(12);
    const passwordHash = await passwordService.hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        clientId,
        role: UserRole.CUSTOMER,
        passwordHash,
        isVerified: true, // Created by admin
      },
    });

    // Record consent
    await prisma.policyConsent.create({
      data: {
        userId: user.id,
        policyVersion: "1.0",
        purpose: "ADMIN_ONBOARDED_CONSENT",
      },
    });

    return {
      id: user.clientId,
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phoneNumber ?? undefined,
      tier: dto.tier || "Dedicated Desk",
      status: "Active",
      lastVisit: "Just now",
      joinedDate: new Date(user.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      totalBookings: 0,
      totalSpent: 0,
      isVerified: true,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const customerService = new CustomerService();
