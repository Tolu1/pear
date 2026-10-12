import { BadGatewayException } from '@nestjs/common';

export class BridgeFailedException extends BadGatewayException {
  constructor(step: string) {
    super(`Bridging USDC from Arc to Base failed at ${step}`);
  }
}
