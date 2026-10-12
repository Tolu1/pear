import { ForbiddenException, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 as uuidv4 } from 'uuid';
import { type Hash, parseUnits } from 'viem';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { PaymentIntentMapper } from './payment-intent.mapper';
import { QuotesService } from '../quotes/quotes.service';
import { VirtualCardService } from '../virtual-card/virtual-card.service';
import { TokensService } from '../tokens/tokens.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PaymentIntent } from './interfaces/payment-intent.interface';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { PaymentIntentConflictException } from './exceptions/payment-intent-conflict.exception';
import { UnsupportedCardCurrencyException } from './exceptions/unsupported-card-currency.exception';
import { VirtualCard } from '../virtual-card/interfaces/virtual-card.interface';
import { type DrizzleAdapter } from '../drizzle/drizzle.module';

const PAYMENT_INTENT_TTL_MINUTES = 30;
const SERIALIZATION_FAILURE = '40001';

@Injectable()
export class PaymentIntentsService {
  constructor(
    private readonly paymentIntentsRepository: PaymentIntentsRepository,
    private readonly quotesService: QuotesService,
    private readonly virtualCardService: VirtualCardService,
    private readonly tokensService: TokensService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Transactional()
  async create(dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    const quote = await this.quotesService.findActive(dto.quoteId);
    if (quote.currencyCode !== 'USD') {
      throw new UnsupportedCardCurrencyException(quote.currencyCode);
    }
    const rail = this.tokensService.findRail(dto.railId);

    const expiresAt = new Date(
      Date.now() + PAYMENT_INTENT_TTL_MINUTES * 60 * 1000,
    );

    const intentRow = await this.paymentIntentsRepository.create({
      id: `pi_${uuidv4()}`,
      quoteId: quote.id,
      railId: rail.id,
      fromAddress: dto.fromAddress,
      merchantDomain: dto.merchantDomain,
      metadata: dto.metadata ?? null,
      expiresAt,
      status: PaymentIntentStatus.REQUIRES_TRANSFER,
    });

    await this.quotesService.markConsumed(quote.id);

    return PaymentIntentMapper.toDomain(intentRow, quote, rail);
  }

  async findOne(id: string): Promise<PaymentIntent> {
    const intentRow = await this.paymentIntentsRepository.findOne(id);
    const quote = await this.quotesService.findOne(intentRow.quoteId);
    const rail = this.tokensService.findRail(intentRow.railId);
    return PaymentIntentMapper.toDomain(intentRow, quote, rail);
  }

  async getCard(id: string): Promise<VirtualCard> {
    const intent = await this.findOne(id);
    if (intent.status !== PaymentIntentStatus.PROCESSING || !intent.cardId) {
      throw new ForbiddenException('Card details not available');
    }
    return this.virtualCardService.get(intent.cardId);
  }

  async submit(id: string, txHash: Hash): Promise<PaymentIntent> {
    const intent = await this.findOne(id);
    if (intent.status !== PaymentIntentStatus.REQUIRES_TRANSFER) {
      throw new PaymentIntentConflictException();
    }

    const token = this.tokensService.findOne(intent.quote.tokenId);

    await this.blockchainService.assertTransfer(
      txHash,
      {
        from: intent.fromAddress,
        to: intent.rail.paymentAddress,
        value: parseUnits(intent.quote.cryptoAmount, token.decimals),
        tokenAddress: intent.rail.tokenAddress,
        chainId: intent.rail.chainId,
      },
      intent.rail.confirmations,
    );

    await this.markProcessing(id, txHash).catch((error: unknown) => {
      if ((error as { code?: string }).code === SERIALIZATION_FAILURE) {
        throw new PaymentIntentConflictException();
      }
      throw error;
    });

    const cardId = await this.virtualCardService.issue(intent.quote.amount);
    const intentRow = await this.paymentIntentsRepository.update(id, {
      cardId,
      updatedAt: new Date(),
    });

    return PaymentIntentMapper.toDomain(intentRow, intent.quote, intent.rail);
  }

  @Transactional<DrizzleAdapter>({ isolationLevel: 'serializable' })
  private async markProcessing(id: string, txHash: Hash): Promise<void> {
    const intentRow = await this.paymentIntentsRepository.findOne(id);
    const status = intentRow.status as PaymentIntentStatus;
    if (status !== PaymentIntentStatus.REQUIRES_TRANSFER) {
      throw new PaymentIntentConflictException();
    }
    await this.paymentIntentsRepository.update(id, {
      status: PaymentIntentStatus.PROCESSING,
      txHash,
      updatedAt: new Date(),
    });
  }

  async complete(id: string): Promise<void> {
    const intent = await this.findOne(id);
    if (intent.status === PaymentIntentStatus.SUCCEEDED) return;
    if (intent.status !== PaymentIntentStatus.PROCESSING) {
      throw new PaymentIntentConflictException();
    }
    await this.paymentIntentsRepository.update(intent.id, {
      status: PaymentIntentStatus.SUCCEEDED,
      updatedAt: new Date(),
    });
  }
}
