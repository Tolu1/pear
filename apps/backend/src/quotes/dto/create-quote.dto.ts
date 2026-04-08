import { IsNotEmpty, IsNumberString, IsString, IsIn } from 'class-validator';
import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES_CODES,
} from '../../common/constants/supported-currencies.contant';
import {
  type TokenId,
  SUPPORTED_TOKEN_IDS,
  type Blockchain,
  SUPPORTED_BLOCKCHAINS,
} from '../../common/constants/supported-tokens.constant';

export class CreateQuoteDto {
  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES_CODES)
  currency: CurrencyCode;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_TOKEN_IDS)
  tokenId: TokenId;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_BLOCKCHAINS)
  blockchain: Blockchain;
}
