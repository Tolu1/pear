import type { CurrencyCode } from '../constants/supported-currencies.contant';
import type {
  TokenId,
  Blockchain,
} from '../../tokens/constants/supported-tokens.constant';
import type { PaymentStatus } from '../../database/database.types';

export interface Payment {
  id: string;
  merchantDomain: string;
  paymentUrl: string;
  from: `0x${string}`;
  fiatAmount: string;
  fiatCurrency: CurrencyCode;
  tokenAmount: string;
  tokenId: TokenId;
  blockchain: Blockchain;
  status: PaymentStatus;
}
