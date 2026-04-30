import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { PaymentIntentMapper } from './payment-intent.mapper';
import { QuotesService } from '../quotes/quotes.service';
import { VirtualCardService } from '../virtual-card/virtual-card.service';
import { getTokenNetworkConfig } from '../common/constants/supported-tokens.constant';
import { type Erc20Transfer } from './interfaces/erc20-transfer.interface';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { PaymentIntent } from './interfaces/payment-intent.interface';
import { QuoteExpiredException } from './exceptions/quote-expired.exception';
import { PaymentIntentConflictException } from './exceptions/payment-intent-conflict.exception';
import { VirtualCard } from '../virtual-card/interfaces/virtual-card.interface';

const PAYMENT_INTENT_TTL_MINUTES = 30;

@Injectable()
export class PaymentIntentsService {
  constructor(
    private readonly paymentIntentsRepository: PaymentIntentsRepository,
    private readonly quotesService: QuotesService,
    private readonly virtualCardService: VirtualCardService,
  ) {}

  async create(dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    const quote = await this.quotesService.findOne(dto.quoteId);

    if (new Date() > quote.expiresAt) {
      throw new QuoteExpiredException();
    }

    const tokenConfig = getTokenNetworkConfig(quote.tokenId, quote.blockchain);

    if (!tokenConfig) {
      throw new BadRequestException(
        `Unsupported token ${quote.tokenId} on ${quote.blockchain}`,
      );
    }

    const expiresAt = new Date(
      Date.now() + PAYMENT_INTENT_TTL_MINUTES * 60 * 1000,
    );

    const intent = await this.paymentIntentsRepository.create({
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
      status: PaymentIntentStatus.REQUIRES_TRANSFER,
    });

    return PaymentIntentMapper.toDomain(intent);
  }

  async findOne(id: string): Promise<PaymentIntent> {
    const intent = await this.paymentIntentsRepository.findOne(id);
    return PaymentIntentMapper.toDomain(intent);
  }

  async getCard(id: string): Promise<VirtualCard> {
    const intent = await this.findOne(id);

    if (intent.status !== PaymentIntentStatus.PROCESSING) {
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

    await this.paymentIntentsRepository.updateStatus(
      intent.id,
      PaymentIntentStatus.PROCESSING,
    );
  }

  async complete(id: string): Promise<void> {
    const intent = await this.findOne(id);

    if (intent.status !== PaymentIntentStatus.PROCESSING) {
      throw new PaymentIntentConflictException();
    }

    await this.paymentIntentsRepository.updateStatus(
      id,
      PaymentIntentStatus.SUCCEEDED,
    );
  }
}
