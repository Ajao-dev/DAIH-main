export enum BookingState {
  DRAFT = "DRAFT",
  HELD = "HELD",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  ACTIVE = "ACTIVE",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  NO_SHOW = "NO_SHOW",
}

export enum ResourceCategory {
  HOT_DESK = "HOT_DESK",
  FLEX_DESK = "FLEX_DESK",
  DEDICATED_DESK = "DEDICATED_DESK",
  OFFICE_SUITE = "OFFICE_SUITE",
  CONFERENCE_HALL = "CONFERENCE_HALL",
  TRAINING_ROOM = "TRAINING_ROOM",
  ROOFTOP_LOUNGE = "ROOFTOP_LOUNGE",
  STUDIO = "STUDIO",
}

export enum CalendarDayStatus {
  AVAILABLE = "AVAILABLE",
  LIMITED = "LIMITED",
  FULL = "FULL",
  BLACKOUT = "BLACKOUT",
  CLOSED = "CLOSED",
}

export interface BookingHoldDTO {
  bookingId: string;
  resourceId: string;
  resourceName?: string;
  userId: string;
  startTime: string;
  endTime: string;
  holdExpiresAt: string;
  totalAmount: number;
  currency: string;
  reference: string;
  state: BookingState;
}

export interface CreateBookingDTO {
  resourceId: string;
  startTime: string;
  endTime: string;
  planId?: string;
  notes?: string;
}

export interface AvailabilityQueryDTO {
  resourceId: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityResultDTO {
  available: boolean;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  capacity: number;
  activeCount: number;
  remainingSpots: number;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface CalendarAvailabilityQueryDTO {
  resourceId: string;
  month?: string; // YYYY-MM format
}

export interface CalendarDayInfo {
  status: CalendarDayStatus;
  remainingSpots?: number;
  reason?: string;
  bookedHourSlots?: number[]; // Array of booked hours 0-23
}

export interface CalendarAvailabilityResultDTO {
  resourceId: string;
  resourceName: string;
  capacity: number;
  month: string;
  defaultStatus: CalendarDayStatus;
  busyDates: Record<string, CalendarDayInfo>; // Sparse map: YYYY-MM-DD -> Info
}

export interface CancelBookingDTO {
  reason?: string;
}

export interface AdminOverrideBookingDTO {
  resourceId: string;
  customerEmail?: string;
  userId?: string;
  startTime: string;
  endTime: string;
  planId?: string;
  totalAmount?: number;
  currency?: string;
  state?: BookingState.HELD | BookingState.CONFIRMED;
  overrideReason: string;
  waiveFee?: boolean;
}

export interface BookingFilterDTO {
  state?: BookingState | string;
  status?: BookingState | string;
  resourceId?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface BookingSummary {
  id: string;
  reference: string;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  startTime: string;
  endTime: string;
  state: BookingState;
  qrToken?: string;
  amount: number;
  currency: string;
  holdExpiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}
