export enum BookingState {
  DRAFT = 'DRAFT',
  HELD = 'HELD',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  NO_SHOW = 'NO_SHOW',
}

export enum ResourceCategory {
  HOT_DESK = 'HOT_DESK',
  DEDICATED_DESK = 'DEDICATED_DESK',
  OFFICE_SUITE = 'OFFICE_SUITE',
  CONFERENCE_HALL = 'CONFERENCE_HALL',
  TRAINING_ROOM = 'TRAINING_ROOM',
}

export interface BookingHoldDTO {
  bookingId: string;
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  holdExpiresAt: string;
  totalAmount: number;
  currency: string;
}

export interface CreateBookingDTO {
  resourceId: string;
  startTime: string;
  endTime: string;
  planId?: string;
  notes?: string;
}

export interface BookingSummary {
  id: string;
  reference: string;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  userId: string;
  customerName: string;
  startTime: string;
  endTime: string;
  state: BookingState;
  qrToken?: string;
  amount: number;
  currency: string;
  createdAt: string;
}
