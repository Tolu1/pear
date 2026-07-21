import { BadRequestException } from '@nestjs/common';

export class QuoteExpiredException extends BadRequestException {
  constructor() {
    super('Quote has expired');
  }
}
