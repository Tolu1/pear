import type { Address } from "viem";

export type PaymentIntentStatus =
  | "requires_transfer"
  | "processing"
  | "succeeded"
  | "failed"
  | "expired"
  | "canceled";

export interface PaymentIntent {
  id: string;
  quoteId: string;
  status: PaymentIntentStatus;
  amount: string;
  currency: string;
  cryptoAmount: bigint;
  tokenId: string;
  blockchain: string;
  contractAddress: Address;
  paymentAddress: Address;
  fromAddress: Address;
  merchantDomain: string;
  metadata: unknown;
  expiresAt: Date;
  createdAt: Date;
}
