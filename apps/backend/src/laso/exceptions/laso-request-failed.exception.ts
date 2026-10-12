import { BadGatewayException } from '@nestjs/common';

export class LasoRequestFailedException extends BadGatewayException {
  constructor(route: string, status: number) {
    super(`Laso ${route} failed with status ${status}`);
  }
}
