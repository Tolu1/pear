import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { IsValidRailId } from '../../tokens/validators/is-valid-rail-id.validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  quoteId: string;

  @IsNotEmpty()
  @IsValidRailId()
  railId: string;

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
