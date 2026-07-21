import { BadGatewayException } from '@nestjs/common';

export class VirtualCardUnavailableException extends BadGatewayException {
  constructor(intentId: string) {
    super(`Could not retrieve virtual card for intent ${intentId}`);
  }
}
