import { ConflictException } from '@nestjs/common';

export class PaymentIntentConflictException extends ConflictException {
  constructor() {
    super('Payment intent is not in processing state');
  }
}
