import { BadRequestException } from '@nestjs/common';

export class UnsupportedCardCurrencyException extends BadRequestException {
  constructor(currencyCode: string) {
    super(`Virtual cards can't be issued in ${currencyCode}`);
  }
}
