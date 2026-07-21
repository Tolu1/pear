import { IsNotEmpty, IsNumberString, IsIn } from 'class-validator';
import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES_CODES,
} from '../../common/constants/supported-currencies.contant';
import { IsValidTokenId } from '../../tokens/validators/is-valid-token-id.validator';

export class CreateQuoteDto {
  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsIn(SUPPORTED_CURRENCIES_CODES)
  currencyCode: CurrencyCode;

  @IsNotEmpty()
  @IsValidTokenId()
  tokenId: string;
}
