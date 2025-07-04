import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsIn,
  IsArray,
} from 'class-validator';
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

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  merchantDomain: string;

  @IsNotEmpty()
  @IsString()
  paymentUrl: string;

  @IsNotEmpty()
  @IsString()
  from: `0x${string}`;

  @IsNotEmpty()
  @IsNumberString()
  fiatAmount: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES_CODES)
  fiatCurrencyCode: CurrencyCode;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_TOKEN_IDS)
  tokenId: TokenId;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_BLOCKCHAINS)
  blockchain: Blockchain;

  @IsArray()
  @IsString({ each: true })
  cookies: string[];
}
