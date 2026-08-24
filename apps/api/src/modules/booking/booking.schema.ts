import { z } from 'zod';
import { BookingState } from '@daih/types';
import { sanitizeString } from '../../middleware/validate.middleware.js';

export const BookingIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Booking ID is required').transform(sanitizeString),
});

export const CheckAvailabilitySchema = z.object({
  resourceId: z.string().min(1, 'Resource ID or slug is required').transform(sanitizeString),
  startTime: z.string().datetime({ message: 'Valid ISO startTime is required' }),
  endTime: z.string().datetime({ message: 'Valid ISO endTime is required' }),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'endTime must be strictly after startTime', path: ['endTime'] }
);

export const CalendarAvailabilitySchema = z.object({
  resourceId: z.string().min(1, 'Resource ID or slug is required').transform(sanitizeString),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)').optional(),
});

export const CreateHoldSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID or slug is required').transform(sanitizeString),
  startTime: z.string().datetime({ message: 'Valid ISO startTime is required' }),
  endTime: z.string().datetime({ message: 'Valid ISO endTime is required' }),
  planId: z.string().optional(),
  notes: z.string().max(500).optional().transform((val) => val ? sanitizeString(val) : val),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'endTime must be strictly after startTime', path: ['endTime'] }
);

export const CancelBookingSchema = z.object({
  reason: z.string().max(300).optional().transform((val) => val ? sanitizeString(val) : val),
});

export const AdminOverrideBookingSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID or slug is required').transform(sanitizeString),
  startTime: z.string().datetime({ message: 'Valid ISO startTime is required' }),
  endTime: z.string().datetime({ message: 'Valid ISO endTime is required' }),
  customerEmail: z.string().email('Valid customer email is required').optional(),
  userId: z.string().optional(),
  planId: z.string().optional(),
  totalAmount: z.number().nonnegative().optional(),
  currency: z.string().default('NGN').transform(sanitizeString),
  state: z.enum([BookingState.HELD, BookingState.CONFIRMED]).default(BookingState.CONFIRMED),
  overrideReason: z.string().min(5, 'Mandatory override reason of at least 5 characters is required').transform(sanitizeString),
  waiveFee: z.boolean().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'endTime must be strictly after startTime', path: ['endTime'] }
);

export const BookingFilterSchema = z.object({
  state: z.string().optional(),
  resourceId: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional().transform((val) => val ? sanitizeString(val) : val),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;
export type CalendarAvailabilityInput = z.infer<typeof CalendarAvailabilitySchema>;
export type CreateHoldInput = z.infer<typeof CreateHoldSchema>;
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;
export type AdminOverrideBookingInput = z.infer<typeof AdminOverrideBookingSchema>;
export type BookingFilterInput = z.infer<typeof BookingFilterSchema>;
