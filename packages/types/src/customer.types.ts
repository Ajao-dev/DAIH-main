export interface CustomerRecord {
  id: string; // Client ID, e.g. DAIH-2026-000042
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  tier: string;
  status: 'Active' | 'Pending' | 'Inactive';
  lastVisit: string;
  joinedDate: string;
  totalBookings: number;
  totalSpent: number;
  isVerified: boolean;
  createdAt: string;
}

export interface CustomerMetrics {
  totalMembers: number;
  activeNow: number;
  newThisMonth: number;
  mrrGrowth: string;
}

export interface CustomerListResponse {
  customers: CustomerRecord[];
  total: number;
  page: number;
  limit: number;
  metrics: CustomerMetrics;
}

export interface CustomerFilterDTO {
  search?: string;
  status?: string;
  tier?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  tier?: string;
  sendInvite?: boolean;
}
