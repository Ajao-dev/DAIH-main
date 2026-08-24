import { z } from "zod";
import { sanitizeString } from "../../middleware/validate.middleware.js";

export const InitializePaymentParamsSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .min(1, "Booking ID is required")
    .transform(sanitizeString),
});

export const PaystackWebhookSchema = z.object({
  event: z
    .string()
    .trim()
    .min(1, "Webhook event is required")
    .transform(sanitizeString),
  data: z.record(z.unknown()).optional(),
});
