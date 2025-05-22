import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsDecimal,
} from 'class-validator';

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
  @IsEnum(['NGN', 'USD', 'EUR', 'GBP'])
  currency: string;
}
