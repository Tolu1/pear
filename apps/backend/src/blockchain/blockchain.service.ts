import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, Transport, type PublicClient } from 'viem';
import { lisk, liskSepolia } from 'viem/chains';
import { publicActionsL2 } from 'viem/op-stack';
import { SUPPORTED_TOKENS } from '../tokens/constants/supported-tokens.constant';

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
}

type Chain = typeof lisk | typeof liskSepolia;

@Injectable()
export class BlockchainService {
  private publicClient: PublicClient<Transport, Chain>;

  constructor(private configService: ConfigService) {
    const alchemyApiKey = this.configService.get<string>('ALCHEMY_API_KEY');

    this.publicClient = createPublicClient({
      chain: lisk,
      transport: http(`https://lisk-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    }).extend(publicActionsL2());
  }

  async watchForPayment(
    paymentId: string,
    from: `0x${string}`,
    to: `0x${string}`,
    amount: string,
  ): Promise<TransactionData> {
    return new Promise((resolve, reject) => {
      let unwatch: (() => void) | undefined;
      const TIMEOUT = 15 * 60 * 1000; // 15 minutes;
      const timeout = setTimeout(() => {
        unwatch?.();
        reject(
          new Error(
            `Payment timeout: No payment received for ${paymentId} after 15 minutes`,
          ),
        );
      }, TIMEOUT);

      unwatch = this.publicClient.watchEvent({});
    });
  }
}
