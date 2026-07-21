import { UnprocessableEntityException } from '@nestjs/common';

export class TransferFailedException extends UnprocessableEntityException {
  constructor() {
    super('On-chain transfer did not succeed');
  }
}
