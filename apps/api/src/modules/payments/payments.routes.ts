import express, { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/rbac.middleware.js";
import { UserRole } from "@daih/types";
import {
  validateParams,
  validateBody,
  validateQuery,
} from "../../middleware/validate.middleware.js";
import { paymentsController } from "./payments.controller.js";
import { verifyPaystackWebhookSignature } from "./webhook.verifier.js";
import {
  InitializePaymentParamsSchema,
  InitializePaymentBodySchema,
  TransactionIdParamsSchema,
  BookingIdParamsSchema,
  RefundBodySchema,
  RequestRefundBodySchema,
  TransactionFilterQuerySchema,
  ReconciliationQuerySchema,
  DailySummaryQuerySchema,
} from "./payments.schema.js";

// Dedicated Webhook Router that preserves raw body for cryptographic HMAC verification
export const paymentsWebhookRouter = Router();

paymentsWebhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  verifyPaystackWebhookSignature,
  paymentsController.webhook,
);

// Main Payments API Router
export const paymentsRouter = Router();

// Customer: Initialize Paystack checkout
paymentsRouter.post(
  "/initialize/:bookingId",
  authenticate,
  validateParams(InitializePaymentParamsSchema),
  validateBody(InitializePaymentBodySchema),
  paymentsController.initialize,
);

// Customer: Personal Payment History
paymentsRouter.get("/history", authenticate, paymentsController.getHistory);

// Customer: Request refund for a cancelled booking
paymentsRouter.post(
  "/bookings/:bookingId/refund-request",
  authenticate,
  validateParams(BookingIdParamsSchema),
  validateBody(RequestRefundBodySchema),
  paymentsController.requestRefund,
);

// Finance Officer / Admin: List all transactions with filters
paymentsRouter.get(
  "/admin/transactions",
  authenticate,
  requireRoles([
    UserRole.FINANCE_OFFICER,
    UserRole.SUPER_ADMIN,
    UserRole.MANAGEMENT_VIEWER,
  ]),
  validateQuery(TransactionFilterQuerySchema),
  paymentsController.getAdminTransactions,
);

// Finance Officer / Admin: Reconciliation overview
paymentsRouter.get(
  "/admin/reconciliation",
  authenticate,
  requireRoles([
    UserRole.FINANCE_OFFICER,
    UserRole.SUPER_ADMIN,
    UserRole.MANAGEMENT_VIEWER,
  ]),
  validateQuery(ReconciliationQuerySchema),
  paymentsController.getReconciliation,
);

// Finance Officer / Admin: Daily summary
paymentsRouter.get(
  "/admin/daily-summary",
  authenticate,
  requireRoles([
    UserRole.FINANCE_OFFICER,
    UserRole.SUPER_ADMIN,
    UserRole.MANAGEMENT_VIEWER,
  ]),
  validateQuery(DailySummaryQuerySchema),
  paymentsController.getDailySummary,
);

// Finance Officer / Super Admin: Process refund
paymentsRouter.post(
  "/:transactionId/refund",
  authenticate,
  requireRoles([UserRole.FINANCE_OFFICER, UserRole.SUPER_ADMIN]),
  validateParams(TransactionIdParamsSchema),
  validateBody(RefundBodySchema),
  paymentsController.processRefund,
);

// Customer / Staff: Get transaction details
paymentsRouter.get(
  "/:transactionId",
  authenticate,
  validateParams(TransactionIdParamsSchema),
  paymentsController.getTransaction,
);

// Customer: Poll payment status / verify
paymentsRouter.post(
  "/:transactionId/verify",
  authenticate,
  validateParams(TransactionIdParamsSchema),
  paymentsController.verifyPayment,
);

// Customer: Get invoice / receipt for transaction
paymentsRouter.get(
  "/:transactionId/invoice",
  authenticate,
  validateParams(TransactionIdParamsSchema),
  paymentsController.getInvoice,
);
