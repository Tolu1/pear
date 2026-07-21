import { NotFoundException } from '@nestjs/common';

export class PaymentIntentNotFoundException extends NotFoundException {
  constructor() {
    super('Payment intent not found');
  }
}
