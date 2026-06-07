import { BadRequestException } from '@nestjs/common';

export class UnsupportedChainException extends BadRequestException {
  constructor(chainId: number) {
    super(`Unsupported chain: ${chainId}`);
  }
}
