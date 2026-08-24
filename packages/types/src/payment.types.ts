export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  PAYSTACK = 'PAYSTACK',
  SUBSCRIPTION_CREDIT = 'SUBSCRIPTION_CREDIT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  POS_TERMINAL = 'POS_TERMINAL',
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  paystackReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
}
