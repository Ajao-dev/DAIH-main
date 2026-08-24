import {
  BookingHoldDTO,
  BookingSummary,
  CreateBookingDTO,
  AvailabilityQueryDTO,
  AvailabilityResultDTO,
  CalendarAvailabilityQueryDTO,
  CalendarAvailabilityResultDTO,
  AdminOverrideBookingDTO,
  BookingFilterDTO,
  CancelBookingDTO,
  FacilityResource,
  ResourcePricingPlan,
  ResourceSchedule,
  ResourceBlackout,
  CreateResourceDTO,
  UpdateResourceDTO,
  CreatePricingPlanDTO,
  UpdatePricingPlanDTO,
  CreateBlackoutDTO,
  UpsertScheduleDTO,
  PaystackInitializeResponse,
  UserProfile,
  UserRole,
  CustomerRecord,
  CustomerListResponse,
  CustomerFilterDTO,
  CreateCustomerDTO,
  CustomerMetrics,
} from "@daih/types";
import { apiCacheManager } from "./cache";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientConfig {
  baseUrl?: string;
  getToken?: () => string | null | Promise<string | null>;
  setToken?: (token: string | null) => void;
  onSessionExpired?: () => void;
}

export class DaihApiClient {
  private baseUrl: string;
  private inMemoryToken: string | null = null;
  private getTokenFn?: () => string | null | Promise<string | null>;
  private setTokenFn?: (token: string | null) => void;
  private onSessionExpiredFn?: () => void;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor(config: ApiClientConfig = {}) {
    const rawUrl =
      config.baseUrl ||
      (typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        : "http://localhost:4000");
    const cleanUrl = rawUrl.replace(/\/$/, "");
    this.baseUrl = cleanUrl.endsWith("/api/v1")
      ? cleanUrl
      : `${cleanUrl}/api/v1`;
    this.getTokenFn = config.getToken;
    this.setTokenFn = config.setToken;
    this.onSessionExpiredFn = config.onSessionExpired;
  }

  setOnSessionExpired(fn: () => void): void {
    this.onSessionExpiredFn = fn;
  }

  setAccessToken(token: string | null): void {
    this.inMemoryToken = token;
    if (typeof window !== "undefined") {
      try {
        if (token) {
          localStorage.setItem("daih_access_token", token);
        } else {
          localStorage.removeItem("daih_access_token");
        }
      } catch {}
    }
    if (this.setTokenFn) {
      this.setTokenFn(token);
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (this.getTokenFn) {
      const customToken = await this.getTokenFn();
      if (customToken !== undefined) return customToken;
    }
    if (this.inMemoryToken) return this.inMemoryToken;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("daih_access_token");
        if (stored) {
          this.inMemoryToken = stored;
          return stored;
        }
      } catch {}
    }
    return null;
  }

  private onTokenRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string | null) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure: boolean = true,
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = await this.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Always include credentials to ensure HttpOnly refresh cookies are sent
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: "include",
    };

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (networkError: any) {
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        networkError?.message || "Unable to connect to the server",
      );
    }

    // Transparent token refresh on 401
    if (
      response.status === 401 &&
      retryOnAuthFailure &&
      !cleanEndpoint.includes("/identity/login") &&
      !cleanEndpoint.includes("/identity/register") &&
      !cleanEndpoint.includes("/identity/refresh")
    ) {
      if (this.isRefreshing) {
        // Wait for active in-flight refresh to finish
        const retryToken = await new Promise<string | null>((resolve) => {
          this.addRefreshSubscriber((newToken) => resolve(newToken));
        });

        if (retryToken) {
          headers.set("Authorization", `Bearer ${retryToken}`);
          return this.request<T>(endpoint, { ...options, headers }, false);
        }
      } else {
        this.isRefreshing = true;
        try {
          const refreshRes = await this.auth.refresh();
          const newToken = refreshRes.accessToken || refreshRes.token || null;
          this.isRefreshing = false;
          this.onTokenRefreshed(newToken);

          if (newToken) {
            headers.set("Authorization", `Bearer ${newToken}`);
            return this.request<T>(endpoint, { ...options, headers }, false);
          }
        } catch (refreshErr) {
          this.isRefreshing = false;
          this.setAccessToken(null);
          this.onTokenRefreshed(null);
          if (this.onSessionExpiredFn) {
            this.onSessionExpiredFn();
          }
        }
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detailMsg =
        data.details && Array.isArray(data.details) && data.details.length > 0
          ? `: ${data.details.map((d: any) => `${d.field ? d.field + ": " : ""}${d.message}`).join(", ")}`
          : "";
      throw new ApiError(
        response.status,
        data.code || "API_ERROR",
        (data.message || "An unexpected API error occurred") + detailMsg,
        data.details,
      );
    }

    return data.data !== undefined ? data.data : data;
  }

  // Identity / Auth API
  public auth = {
    login: async (credentials: {
      email: string;
      password: string;
      portal?: "customer" | "admin" | string;
      audience?: "CUSTOMER" | "ADMIN" | string;
    }) => {
      const res = await this.request<{
        accessToken?: string;
        token?: string;
        user: UserProfile;
      }>("/identity/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      const jwt = res.accessToken || res.token || null;
      if (jwt) {
        this.setAccessToken(jwt);
      }
      return { ...res, accessToken: jwt || "" };
    },

    register: (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      policyVersion?: string;
      consented: boolean;
    }) =>
      this.request<{ user: UserProfile; verificationSent: boolean }>(
        "/identity/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),

    refresh: async () => {
      const res = await this.request<{
        accessToken: string;
        user: UserProfile;
        token?: string;
      }>("/identity/refresh", {
        method: "POST",
      });
      const token = res.accessToken || res.token;
      if (token) {
        this.setAccessToken(token);
      }
      return res;
    },

    logout: async () => {
      try {
        await this.request("/identity/logout", { method: "POST" });
      } finally {
        this.setAccessToken(null);
      }
    },

    getProfile: () => this.request<UserProfile>("/identity/me"),

    verifyEmail: (token: string) =>
      this.request<{ success: boolean; message: string }>(
        "/identity/verify-email",
        {
          method: "POST",
          body: JSON.stringify({ token }),
        },
      ),

    resendVerification: (email: string) =>
      this.request<{ success: boolean; message: string }>(
        "/identity/resend-verification",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      ),

    requestPasswordReset: (email: string) =>
      this.request<{ success: boolean; message: string }>(
        "/identity/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      ),

    resetPassword: (payload: { token: string; newPassword: string }) =>
      this.request<{ success: boolean; message: string }>(
        "/identity/reset-password",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),

    confirmPasswordReset: (payload: { token: string; newPassword: string }) =>
      this.auth.resetPassword(payload),

    getStaffUsers: () => this.adminUsers.getStaffUsers(),

    createStaffUser: (payload: any) => this.adminUsers.createStaffUser(payload),
  };

  // Catalogue & Resources API
  public catalogue = {
    getResources: (options?: { forceRefresh?: boolean }) =>
      apiCacheManager.fetchWithCache<FacilityResource[]>(
        "catalogue_resources",
        () => this.request<FacilityResource[]>("/catalogue/resources"),
        60000,
        options,
      ),

    getResourceBySlug: (slug: string, options?: { forceRefresh?: boolean }) =>
      apiCacheManager.fetchWithCache<FacilityResource>(
        `catalogue_resource_${slug}`,
        () => this.request<FacilityResource>(`/catalogue/resources/${slug}`),
        60000,
        options,
      ),

    getResourceById: (id: string, options?: { forceRefresh?: boolean }) =>
      this.catalogue.getResourceBySlug(id, options),

    getAdminResources: () =>
      this.request<FacilityResource[]>("/catalogue/admin/resources"),

    createResource: async (dto: CreateResourceDTO) => {
      const res = await this.request<FacilityResource>(
        "/catalogue/admin/resources",
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    updateResource: async (id: string, dto: UpdateResourceDTO) => {
      const res = await this.request<FacilityResource>(
        `/catalogue/admin/resources/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(dto),
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    deleteResource: async (id: string) => {
      const res = await this.request<{ success: boolean }>(
        `/catalogue/admin/resources/${id}`,
        {
          method: "DELETE",
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    addPricingPlan: async (resourceId: string, dto: CreatePricingPlanDTO) => {
      const res = await this.request<ResourcePricingPlan>(
        `/catalogue/admin/resources/${resourceId}/pricing`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    createPricingPlan: (resourceId: string, dto: CreatePricingPlanDTO) =>
      this.catalogue.addPricingPlan(resourceId, dto),

    updatePricingPlan: async (pricingId: string, dto: UpdatePricingPlanDTO) => {
      const res = await this.request<ResourcePricingPlan>(
        `/catalogue/admin/pricing/${pricingId}`,
        {
          method: "PUT",
          body: JSON.stringify(dto),
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    deletePricingPlan: async (pricingId: string) => {
      const res = await this.request<{ success: boolean }>(
        `/catalogue/admin/pricing/${pricingId}`,
        { method: "DELETE" },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    upsertSchedules: async (
      resourceId: string,
      schedules: UpsertScheduleDTO[],
    ) => {
      const res = await this.request<ResourceSchedule[]>(
        `/catalogue/admin/resources/${resourceId}/schedules`,
        {
          method: "POST",
          body: JSON.stringify({ schedules }),
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    updateSchedules: (resourceId: string, schedules: UpsertScheduleDTO[]) =>
      this.catalogue.upsertSchedules(resourceId, schedules),

    addBlackout: async (resourceId: string, dto: CreateBlackoutDTO) => {
      const res = await this.request<ResourceBlackout>(
        `/catalogue/admin/resources/${resourceId}/blackouts`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },

    createBlackout: (resourceId: string, dto: CreateBlackoutDTO) =>
      this.catalogue.addBlackout(resourceId, dto),

    deleteBlackout: async (blackoutId: string) => {
      const res = await this.request<{ success: boolean }>(
        `/catalogue/admin/blackouts/${blackoutId}`,
        { method: "DELETE" },
      );
      apiCacheManager.invalidate("catalogue");
      return res;
    },
  };

  // Bookings API
  public bookings = {
    checkAvailability: (
      query: AvailabilityQueryDTO,
      options?: { forceRefresh?: boolean },
    ) => {
      const params = new URLSearchParams({
        resourceId: query.resourceId,
        startTime: query.startTime,
        endTime: query.endTime,
      });
      const cacheKey = `avail_${query.resourceId}_${query.startTime}_${query.endTime}`;
      return apiCacheManager.fetchWithCache<AvailabilityResultDTO>(
        cacheKey,
        () =>
          this.request<AvailabilityResultDTO>(
            `/bookings/availability?${params.toString()}`,
          ),
        15000,
        options,
      );
    },

    getCalendarAvailability: (
      query: CalendarAvailabilityQueryDTO,
      options?: { forceRefresh?: boolean },
    ) => {
      const params = new URLSearchParams({
        resourceId: query.resourceId,
        ...(query.month ? { month: query.month } : {}),
      });
      const cacheKey = `cal_avail_${query.resourceId}_${query.month || ""}`;
      return apiCacheManager.fetchWithCache<CalendarAvailabilityResultDTO>(
        cacheKey,
        () =>
          this.request<CalendarAvailabilityResultDTO>(
            `/bookings/calendar-availability?${params.toString()}`,
          ),
        30000,
        options,
      );
    },

    createHold: async (dto: CreateBookingDTO) => {
      const res = await this.request<BookingHoldDTO>("/bookings/hold", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      apiCacheManager.invalidate("my_bookings");
      apiCacheManager.invalidate("cal_avail");
      return res;
    },

    extendHold: (bookingId: string) =>
      this.request<{ success: boolean; holdExpiresAt: string }>(
        `/bookings/${bookingId}/extend-hold`,
        { method: "POST" },
      ),

    getMyBookings: (options?: { forceRefresh?: boolean }) =>
      apiCacheManager.fetchWithCache<BookingSummary[]>(
        "my_bookings",
        () => this.request<BookingSummary[]>("/bookings/my"),
        30000,
        options,
      ),

    getBookingById: (id: string) =>
      this.request<BookingSummary>(`/bookings/${id}`),

    cancelBooking: async (id: string, reason?: string) => {
      const res = await this.request<{
        success: boolean;
        message: string;
        booking: BookingSummary;
      }>(`/bookings/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      apiCacheManager.invalidate("my_bookings");
      apiCacheManager.invalidate("cal_avail");
      return res;
    },

    confirmBooking: async (bookingId: string) => {
      const res = await this.request<BookingSummary>(
        `/bookings/${bookingId}/confirm`,
        {
          method: "POST",
        },
      );
      apiCacheManager.invalidate("my_bookings");
      apiCacheManager.invalidate("cal_avail");
      return res;
    },

    adminReleaseHold: async (bookingId: string, reason?: string) => {
      const res = await this.request<{ success: boolean; message: string }>(
        `/bookings/admin/${bookingId}/release`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        },
      );
      apiCacheManager.invalidate("my_bookings");
      apiCacheManager.invalidate("cal_avail");
      return res;
    },

    getAdminBookings: async (filter?: BookingFilterDTO) => {
      const params = new URLSearchParams();
      if (filter?.status || filter?.state)
        params.set("state", (filter.status || filter.state) as string);
      if (filter?.search) params.set("search", filter.search);
      if (filter?.dateFrom || filter?.startDate)
        params.set(
          "startDate",
          (filter.dateFrom || filter.startDate) as string,
        );
      if (filter?.dateTo || filter?.endDate)
        params.set("endDate", (filter.dateTo || filter.endDate) as string);
      if (filter?.page) params.set("page", String(filter.page));
      if (filter?.limit) params.set("limit", String(filter.limit));
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await this.request<any>(`/bookings/admin${queryStr}`);
      if (Array.isArray(res)) {
        return { bookings: res, total: res.length };
      }
      return {
        bookings: res.bookings || res.items || [],
        total: res.total ?? (res.bookings?.length || 0),
      };
    },

    adminOverrideBooking: async (
      bookingId: string,
      dto: AdminOverrideBookingDTO,
    ) => {
      const res = await this.request<BookingSummary>(
        `/bookings/admin/${bookingId}/override`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
      );
      apiCacheManager.invalidate("my_bookings");
      apiCacheManager.invalidate("cal_avail");
      return res;
    },

    adminOverride: (dto: AdminOverrideBookingDTO) =>
      this.bookings.adminOverrideBooking(dto.resourceId, dto),

    initializePayment: (bookingId: string) =>
      this.request<PaystackInitializeResponse>(
        `/bookings/${bookingId}/payment/initialize`,
        {
          method: "POST",
        },
      ),
  };

  // Staff / User Management API
  public adminUsers = {
    getStaffUsers: () => {
      return this.request<UserProfile[]>("/identity/admin/users");
    },

    createStaffUser: async (payload: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      role: UserRole;
      password?: string;
    }) => {
      const res = await this.request<any>("/identity/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return (res?.user || res) as UserProfile;
    },
  };

  // Customer Directory API
  public customers = {
    getCustomers: async (
      filter?: CustomerFilterDTO,
    ): Promise<CustomerListResponse> => {
      const params = new URLSearchParams();
      if (filter?.search) params.set("search", filter.search);
      if (filter?.status) params.set("status", filter.status);
      if (filter?.tier) params.set("tier", filter.tier);
      if (filter?.page) params.set("page", String(filter.page));
      if (filter?.limit) params.set("limit", String(filter.limit));
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await this.request<any>(
        `/identity/admin/customers${queryStr}`,
      );
      return (res?.data || res) as CustomerListResponse;
    },

    createCustomer: async (dto: CreateCustomerDTO): Promise<CustomerRecord> => {
      const res = await this.request<any>("/identity/admin/customers", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      return (res?.data || res) as CustomerRecord;
    },
  };

  /**
   * Manually clear client-side API cache
   */
  clearCache(pattern?: string): void {
    apiCacheManager.invalidate(pattern);
  }
}

export const api = new DaihApiClient();
