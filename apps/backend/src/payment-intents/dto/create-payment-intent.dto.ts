import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  quoteId: string;

  @IsNotEmpty()
  @IsString()
  fromAddress: `0x${string}`;

  @IsNotEmpty()
  @IsString()
  merchantDomain: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
