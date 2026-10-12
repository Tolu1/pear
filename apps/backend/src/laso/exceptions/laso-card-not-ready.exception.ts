import { GatewayTimeoutException } from '@nestjs/common';

export class LasoCardNotReadyException extends GatewayTimeoutException {
  constructor(cardId: string) {
    super(`Laso card ${cardId} was not ready in time`);
  }
}
