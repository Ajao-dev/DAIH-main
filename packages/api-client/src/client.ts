import {
  BookingHoldDTO,
  BookingSummary,
  CreateBookingDTO,
  FacilityResource,
  PaystackInitializeResponse,
  UserProfile,
  UserRole,
} from '@daih/types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
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
      (typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        : 'http://localhost:4000');
    const cleanUrl = rawUrl.replace(/\/$/, '');
    this.baseUrl = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
    this.getTokenFn = config.getToken;
    this.setTokenFn = config.setToken;
    this.onSessionExpiredFn = config.onSessionExpired;
  }

  setAccessToken(token: string | null): void {
    this.inMemoryToken = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem('daih_access_token', token);
        } else {
          localStorage.removeItem('daih_access_token');
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
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('daih_access_token');
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
    retryOnAuthFailure: boolean = true
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = await this.getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Always include credentials to ensure HttpOnly refresh cookies are sent
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (networkError: any) {
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        networkError?.message || 'Unable to connect to the server'
      );
    }

    // Transparent token refresh on 401
    if (
      response.status === 401 &&
      retryOnAuthFailure &&
      !cleanEndpoint.includes('/identity/login') &&
      !cleanEndpoint.includes('/identity/refresh')
    ) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const refreshRes = await this.auth.refresh();
          this.isRefreshing = false;
          const newToken = refreshRes.accessToken || refreshRes.token || null;
          this.onTokenRefreshed(newToken);
        } catch (refreshErr) {
          this.isRefreshing = false;
          this.setAccessToken(null);
          this.onTokenRefreshed(null);
          if (this.onSessionExpiredFn) {
            this.onSessionExpiredFn();
          }
          throw refreshErr;
        }
      }

      // Wait for the active refresh to finish
      const retryToken = await new Promise<string | null>((resolve) => {
        this.addRefreshSubscriber((newToken) => resolve(newToken));
      });

      if (retryToken) {
        headers.set('Authorization', `Bearer ${retryToken}`);
        return this.request<T>(endpoint, { ...options, headers }, false);
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detailMsg =
        data.details && Array.isArray(data.details) && data.details.length > 0
          ? `: ${data.details.map((d: any) => `${d.field ? d.field + ': ' : ''}${d.message}`).join(', ')}`
          : '';
      throw new ApiError(
        response.status,
        data.code || 'API_ERROR',
        (data.message || 'An unexpected API error occurred') + detailMsg,
        data.details
      );
    }

    return data.data !== undefined ? data.data : data;
  }

  // Catalogue Module
  catalogue = {
    getResources: () => this.request<FacilityResource[]>('/catalogue/resources'),
    getResourceBySlug: (slug: string) =>
      this.request<FacilityResource>(`/catalogue/resources/${slug}`),
  };

  // Bookings Module
  bookings = {
    createHold: (dto: CreateBookingDTO) =>
      this.request<BookingHoldDTO>('/bookings/hold', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    confirmBooking: (bookingId: string) =>
      this.request<BookingSummary>(`/bookings/${bookingId}/confirm`, {
        method: 'POST',
      }),
    getMyBookings: () => this.request<BookingSummary[]>('/bookings/my'),
    getBookingById: (id: string) =>
      this.request<BookingSummary>(`/bookings/${id}`),
    initializePayment: (bookingId: string) =>
      this.request<PaystackInitializeResponse>(
        `/payments/initialize/${bookingId}`,
        { method: 'POST' }
      ),
  };

  // Access / QR Module
  access = {
    getQRToken: (bookingId: string) =>
      this.request<{ token: string; expiresAt: string }>(
        `/access/qr/${bookingId}`
      ),
    verifyQR: (token: string) =>
      this.request<{ valid: boolean; booking: BookingSummary }>(
        '/access/verify-qr',
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        }
      ),
    checkIn: (bookingId: string) =>
      this.request<{ success: boolean; timestamp: string }>(
        `/access/checkin/${bookingId}`,
        { method: 'POST' }
      ),
    checkOut: (bookingId: string) =>
      this.request<{ success: boolean; timestamp: string }>(
        `/access/checkout/${bookingId}`,
        { method: 'POST' }
      ),
  };

  // Authentication & Identity Module
  auth = {
    register: async (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      policyVersion?: string;
      consented: boolean;
    }) => {
      return this.request<{
        user: UserProfile;
        verificationSent: boolean;
      }>('/identity/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    login: async (credentials: {
      email: string;
      password: string;
      portal?: 'customer' | 'admin' | string;
      audience?: 'CUSTOMER' | 'ADMIN' | string;
    }) => {
      const res = await this.request<{
        accessToken?: string;
        token?: string;
        user: UserProfile;
      }>('/identity/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const token = res.accessToken || res.token || null;
      if (token) {
        this.setAccessToken(token);
      }
      return {
        accessToken: token || '',
        token: token || '',
        user: res.user,
      };
    },

    refresh: async () => {
      const res = await this.request<{
        accessToken?: string;
        token?: string;
        user: UserProfile;
      }>(
        '/identity/refresh',
        {
          method: 'POST',
        },
        false
      );
      const token = res.accessToken || res.token || null;
      if (token) {
        this.setAccessToken(token);
      }
      return {
        accessToken: token || '',
        token: token || '',
        user: res.user,
      };
    },

    logout: async () => {
      try {
        await this.request<{ success: boolean }>(
          '/identity/logout',
          {
            method: 'POST',
          },
          false
        );
      } finally {
        this.setAccessToken(null);
      }
    },

    verifyEmail: (token: string) => {
      return this.request<UserProfile>(
        `/identity/verify-email?token=${encodeURIComponent(token)}`
      );
    },

    resendVerification: (email: string) => {
      return this.request<{ success: boolean; message: string }>(
        '/identity/resend-verification',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
    },

    requestPasswordReset: (email: string) => {
      return this.request<{ success: boolean; message: string }>(
        '/identity/password-reset/request',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
    },

    confirmPasswordReset: (payload: { token: string; newPassword: string }) => {
      return this.request<{ success: boolean; message: string }>(
        '/identity/password-reset/confirm',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
    },

    getProfile: () => {
      return this.request<UserProfile>('/identity/me');
    },

    getStaffUsers: () => {
      return this.request<UserProfile[]>('/identity/admin/users');
    },

    createStaffUser: async (payload: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      role: UserRole;
      password?: string;
    }) => {
      const res = await this.request<any>('/identity/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return (res?.user || res) as UserProfile;
    },
  };
}

export const api = new DaihApiClient();
