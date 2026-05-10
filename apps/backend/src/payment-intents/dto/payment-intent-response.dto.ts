import { type Address } from 'viem';
import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';

class QuoteDto {
  id: string;
  amount: string;
  currencyCode: string;
  cryptoAmount: string;
  rate: string;
  expiresAt: Date;
}

class TokenDto {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  network: string;
  tokenAddress: Address;
  paymentAddress: Address;
  chainId: number;
  confirmations: number;
}

export class PaymentIntentResponseDto {
  id: string;
  status: PaymentIntentStatus;
  fromAddress: Address;
  merchantDomain: string;
  metadata: Record<string, unknown> | null;
  txHash: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  quote: QuoteDto;
  token: TokenDto;
}
