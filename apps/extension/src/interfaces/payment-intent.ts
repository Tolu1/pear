import type { Address } from "viem";

export interface PaymentIntent {
  id: string;
  quoteId: string;
  railId: string;
  status: PaymentIntentStatus;
  amount: string;
  currencyCode: string;
  cryptoAmount: bigint;
  tokenId: string;
  contractAddress: Address;
  paymentAddress: Address;
  fromAddress: Address;
  merchantDomain: string;
  metadata: Record<string, unknown> | null;
  expiresAt: Date;
  createdAt: Date;
}

export type PaymentIntentStatus =
  | "requires_transfer"
  | "processing"
  | "succeeded"
  | "canceled"
  | "expired";
