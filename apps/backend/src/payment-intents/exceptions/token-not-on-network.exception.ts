import { BadRequestException } from '@nestjs/common';

export class TokenNotOnNetworkException extends BadRequestException {
  constructor() {
    super('Token is not deployed on the requested network');
  }
}
