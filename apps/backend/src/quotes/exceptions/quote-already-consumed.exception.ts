import { BadRequestException } from '@nestjs/common';

export class QuoteAlreadyConsumedException extends BadRequestException {
  constructor() {
    super('Quote has already been consumed');
  }
}
