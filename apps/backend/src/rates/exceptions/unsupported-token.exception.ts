import { BadRequestException } from '@nestjs/common';

export class UnsupportedTokenException extends BadRequestException {
  constructor() {
    super('Unsupported token');
  }
}
