import { type Address } from 'viem';
import { PaymentIntent } from '../interfaces/payment-intent.interface';
import { Quote } from '../../quotes/interfaces/quote.interface';
import { TokenRail } from '../../tokens/interfaces/token-rail.interface';
import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';
import { type CurrencyCode } from '../../common/constants/supported-currencies.contant';

export class PaymentIntentResponseDto implements Omit<
  PaymentIntent,
  'quote' | 'rail'
> {
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
  rail: RailDto;
}

export class QuoteDto implements Omit<Quote, 'consumedAt' | 'createdAt'> {
  id: string;
  amount: string;
  currencyCode: CurrencyCode;
  cryptoAmount: string;
  rate: string;
  tokenId: string;
  expiresAt: Date;
}

export class RailDto implements Omit<TokenRail, 'confirmations'> {
  id: string;
  tokenId: string;
  chainId: number;
  network: string;
  tokenAddress: Address;
  paymentAddress: Address;
}
