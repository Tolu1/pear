import { BadRequestException } from '@nestjs/common';

export class TransferMismatchException extends BadRequestException {
  constructor() {
    super('Transaction does not match the expected transfer');
  }
}
