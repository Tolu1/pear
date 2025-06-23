import { IsDecimal } from 'class-validator';

export class PaymentResponseDto {
  id: string;
  domain: string;
  paymentUrl: string;
  @IsDecimal()
  amount: string;
  currencyCode: string;
  tokenId: string;
  from: string;
  tokenAmount: string;
  status: string;
  createdAt: Date;
}
