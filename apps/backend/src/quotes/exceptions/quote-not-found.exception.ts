import { NotFoundException } from '@nestjs/common';

export class QuoteNotFoundException extends NotFoundException {
  constructor() {
    super('Quote not found');
  }
}
