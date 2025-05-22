import { IsDecimal } from 'class-validator';

export class PaymentResponseDto {
  id: string;
  domain: string;
  paymentUrl: string;
  @IsDecimal()
  amount: string;
  currency: string;
  status: string;
}
