import { IsNotEmpty, IsNumberString, IsString, IsIn } from 'class-validator';
import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES_CODES,
} from '../../common/constants/supported-currencies.contant';

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
  tokenId: string;

  @IsNotEmpty()
  @IsString()
  network: string;
}
