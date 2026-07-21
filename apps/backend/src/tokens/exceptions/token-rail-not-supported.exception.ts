import { BadRequestException } from '@nestjs/common';

export class TokenRailNotSupportedException extends BadRequestException {
  constructor() {
    super('Token rail is no longer supported');
  }
}
