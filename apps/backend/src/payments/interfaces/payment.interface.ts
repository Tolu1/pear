import type { CurrencyCode } from '../../common/constants/supported-currencies.contant';
import type {
  TokenId,
  Blockchain,
} from '../../common/constants/supported-tokens.constant';
import type { PaymentStatus } from '../../database/database.types';

export interface Payment {
  id: string;
  merchantDomain: string;
  paymentUrl: string;
  from: `0x${string}`;
  fiatAmount: string;
  fiatCurrencyCode: CurrencyCode;
  tokenAmount: string;
  tokenId: TokenId;
  blockchain: Blockchain;
  status: PaymentStatus;
}
