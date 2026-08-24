import { z } from "zod";
import { sanitizeString } from "../../middleware/validate.middleware.js";

export const VerifyQrSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Access token is required")
    .transform(sanitizeString),
});

export const BookingIdParamSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .min(1, "Booking ID is required")
    .transform(sanitizeString),
});
