import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware.js";
import { PaymentStatus, PaymentMethod } from "@daih/types";

import {
  validateParams,
  validateBody,
} from "../../middleware/validate.middleware.js";
import {
  InitializePaymentParamsSchema,
  PaystackWebhookSchema,
} from "./payments.schema.js";

export const paymentsRouter = Router();

paymentsRouter.post(
  "/initialize/:bookingId",
  authenticate,
  validateParams(InitializePaymentParamsSchema),
  (req: AuthRequest, res: Response) => {
    const { bookingId } = req.params;
    const reference = `DAIH-PAY-${Date.now()}`;

    // Returns Paystack initialization response format
    res.json({
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/mock-checkout-${reference}`,
        access_code: `mock_code_${reference}`,
        reference,
      },
    });
  },
);

paymentsRouter.post(
  "/webhook",
  validateBody(PaystackWebhookSchema),
  (req: Request, res: Response) => {
    // Paystack webhook verification endpoint
    const event = req.body?.event;

    // Webhooks respond 200 OK immediately for idempotency
    res.status(200).json({ received: true });
  },
);

paymentsRouter.get(
  "/history",
  authenticate,
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: [
        {
          id: "tx_01",
          reference: "DAIH-PAY-88219",
          bookingId: "bk_sample_01",
          amount: 45000,
          currency: "NGN",
          status: PaymentStatus.SUCCESSFUL,
          method: PaymentMethod.PAYSTACK,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  },
);
