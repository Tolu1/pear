import { IsNotEmpty, IsString, IsEnum, IsDecimal, IsIn } from 'class-validator';
import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES_CODES,
} from '../constants/supported-currencies.contant';
import {
  type TokenId,
  SUPPORTED_TOKEN_IDS,
} from '../../tokens/constants/supported-tokens.constant';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  domain: string;

  @IsNotEmpty()
  @IsString()
  paymentUrl: string;

  @IsNotEmpty()
  @IsDecimal()
  amount: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(SUPPORTED_CURRENCIES_CODES)
  currencyCode: CurrencyCode;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_TOKEN_IDS)
  tokenId: TokenId;

  @IsNotEmpty()
  @IsString()
  from: `0x${string}`;
}
