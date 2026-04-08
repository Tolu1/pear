import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentIntentDto } from './create-payment-intent.dto';

export class UpdatePaymentIntentDto extends PartialType(
  CreatePaymentIntentDto,
) {}
