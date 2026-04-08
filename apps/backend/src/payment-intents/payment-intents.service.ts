import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { QuotesService } from '../quotes/quotes.service';
import { VirtualCardService } from '../virtual-card/virtual-card.service';
import {
  SUPPORTED_TOKENS,
  type Blockchain,
  type TokenId,
} from '../common/constants/supported-tokens.constant';
import { type Erc20Transfer } from './interfaces/erc20-transfer.interface';

const PAYMENT_INTENT_TTL_MINUTES = 30;

@Injectable()
export class PaymentIntentsService {
  constructor(
    private readonly paymentIntentsRepository: PaymentIntentsRepository,
    private readonly quotesService: QuotesService,
    private readonly virtualCardService: VirtualCardService,
  ) {}

  async create(dto: CreatePaymentIntentDto) {
    const quote = await this.quotesService.findOne(dto.quoteId);

    if (new Date() > quote.expiresAt) {
      throw new BadRequestException('Quote has expired');
    }

    const blockchain = quote.blockchain as Blockchain;
    const tokenId = quote.tokenId as TokenId;
    const blockchainTokens = SUPPORTED_TOKENS[blockchain];
    const tokenConfig =
      blockchainTokens[tokenId as keyof typeof blockchainTokens];

    if (!tokenConfig) {
      throw new BadRequestException(
        `Unsupported token ${tokenId} on ${blockchain}`,
      );
    }

    const expiresAt = new Date(
      Date.now() + PAYMENT_INTENT_TTL_MINUTES * 60 * 1000,
    );

    return this.paymentIntentsRepository.create({
      id: `pi_${uuidv4()}`,
      quoteId: quote.id,
      amount: quote.amount,
      currency: quote.currency,
      cryptoAmount: quote.cryptoAmount,
      tokenId: quote.tokenId,
      blockchain: quote.blockchain,
      paymentAddress: tokenConfig.paymentAddress,
      fromAddress: dto.fromAddress,
      merchantDomain: dto.merchantDomain,
      metadata: dto.metadata ?? null,
      expiresAt,
      status: 'requires_transfer',
    });
  }

  async findOne(id: string) {
    const intent = await this.paymentIntentsRepository.findOne(id);
    if (!intent) throw new NotFoundException('Payment intent not found');
    return intent;
  }

  async getCard(id: string) {
    const intent = await this.findOne(id);

    if (intent.status !== 'processing') {
      throw new ForbiddenException('Card details not available');
    }

    return this.virtualCardService.issueCard();
  }

  async handleCryptoConfirmed(transfer: Erc20Transfer): Promise<void> {
    const intent = await this.paymentIntentsRepository.findPendingByFromAddress(
      transfer.from,
      transfer.blockchain,
    );

    if (!intent) return;

    await this.paymentIntentsRepository.updateStatus(intent.id, 'processing');
  }

  async complete(id: string): Promise<void> {
    const intent = await this.findOne(id);

    if (intent.status !== 'processing') {
      throw new ConflictException('Payment intent is not in processing state');
    }

    await this.paymentIntentsRepository.updateStatus(id, 'succeeded');
  }
}
