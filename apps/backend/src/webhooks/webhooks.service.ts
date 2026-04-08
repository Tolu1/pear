import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { keccak256, toBytes } from 'viem';
import { type MoralisWebhook } from './interfaces/moralis-webhook.interface';
import { PaymentIntentsService } from '../payment-intents/payment-intents.service';
import { type Erc20Transfer } from '../payment-intents/interfaces/erc20-transfer.interface';
import { type Blockchain } from '../common/constants/supported-tokens.constant';

const CHAIN_ID_MAP: Record<string, Blockchain> = {
  '0x2105': 'base',
  '0x14a34': 'baseSepolia',
};

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly paymentIntentsService: PaymentIntentsService,
    private readonly configService: ConfigService,
  ) {}

  async handleMoralisWebhook(
    rawBody: Buffer | undefined,
    body: MoralisWebhook,
    signature: string,
  ): Promise<void> {
    if (!rawBody || !this.verifySignature(rawBody, signature)) return;
    if (!body.confirmed) return;
    if (!body.erc20Transfers?.length) return;

    const blockchain = CHAIN_ID_MAP[body.chainId];
    if (!blockchain) return;

    for (const transfer of body.erc20Transfers) {
      const erc20Transfer: Erc20Transfer = {
        from: transfer.from as `0x${string}`,
        to: transfer.to as `0x${string}`,
        value: transfer.value,
        contractAddress: transfer.contract as `0x${string}`,
        transactionHash: transfer.transactionHash as `0x${string}`,
        blockchain,
      };

      await this.paymentIntentsService.handleCryptoConfirmed(erc20Transfer);
    }
  }

  private verifySignature(rawBody: Buffer, signature: string): boolean {
    const secret =
      this.configService.get<string>('MORALIS_STREAM_SECRET') ?? '';
    const computed = keccak256(toBytes(rawBody.toString() + secret));
    if (computed !== signature) {
      this.logger.warn('Invalid Moralis webhook signature');
      return false;
    }
    return true;
  }
}
