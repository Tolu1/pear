import { ForbiddenException, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 as uuidv4 } from 'uuid';
import { type Hash, parseUnits } from 'viem';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { PaymentIntentMapper } from './payment-intent.mapper';
import { QuotesService } from '../quotes/quotes.service';
import { VirtualCardService } from '../virtual-card/virtual-card.service';
import { TokensService } from '../tokens/tokens.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Quote } from '../quotes/interfaces/quote.interface';
import { Token, TokenNetwork } from '../tokens/interfaces/token.interface';
import { PaymentIntent } from './interfaces/payment-intent.interface';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { PaymentIntentConflictException } from './exceptions/payment-intent-conflict.exception';
import { TokenNotOnNetworkException } from './exceptions/token-not-on-network.exception';
import { VirtualCard } from '../virtual-card/interfaces/virtual-card.interface';

const PAYMENT_INTENT_TTL_MINUTES = 30;

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
  async create(dto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    const quote = await this.quotesService.findActive(dto.quoteId);
    const token = this.tokensService.findOne(quote.tokenId);
    const network = this.requireNetwork(token, quote.network);

    const expiresAt = new Date(
      Date.now() + PAYMENT_INTENT_TTL_MINUTES * 60 * 1000,
    );

    const row = await this.paymentIntentsRepository.create({
      id: `pi_${uuidv4()}`,
      quoteId: quote.id,
      fromAddress: dto.fromAddress,
      merchantDomain: dto.merchantDomain,
      metadata: dto.metadata ?? null,
      expiresAt,
      status: PaymentIntentStatus.REQUIRES_TRANSFER,
    });

    await this.quotesService.markConsumed(quote.id);

    return this.composeResponse(
      PaymentIntentMapper.toDomain(row),
      quote,
      token,
      network,
    );
  }

  async findOne(id: string): Promise<PaymentIntentResponseDto> {
    const intent = await this.loadIntent(id);
    const quote = await this.quotesService.findOne(intent.quoteId);
    const token = this.tokensService.findOne(quote.tokenId);
    const network = this.requireNetwork(token, quote.network);
    return this.composeResponse(intent, quote, token, network);
  }

  async getCard(id: string): Promise<VirtualCard> {
    const intent = await this.loadIntent(id);
    if (intent.status !== PaymentIntentStatus.PROCESSING) {
      throw new ForbiddenException('Card details not available');
    }
    return this.virtualCardService.issueCard();
  }

  async submit(id: string, txHash: Hash): Promise<PaymentIntentResponseDto> {
    const intent = await this.loadIntent(id);
    if (intent.status !== PaymentIntentStatus.REQUIRES_TRANSFER) {
      throw new PaymentIntentConflictException();
    }

    const quote = await this.quotesService.findOne(intent.quoteId);
    const token = this.tokensService.findOne(quote.tokenId);
    const network = this.requireNetwork(token, quote.network);

    await this.blockchainService.assertTransfer(
      txHash,
      {
        from: intent.fromAddress,
        to: network.paymentAddress,
        value: parseUnits(quote.cryptoAmount, token.decimals),
        tokenAddress: network.tokenAddress,
      },
      network.chain,
      network.confirmations,
    );

    const updatedRow = await this.paymentIntentsRepository.update(id, {
      status: PaymentIntentStatus.PROCESSING,
      txHash,
      updatedAt: new Date(),
    });

    return this.composeResponse(
      PaymentIntentMapper.toDomain(updatedRow),
      quote,
      token,
      network,
    );
  }

  async complete(id: string): Promise<void> {
    const intent = await this.loadIntent(id);
    if (intent.status !== PaymentIntentStatus.PROCESSING) {
      throw new PaymentIntentConflictException();
    }
    await this.paymentIntentsRepository.update(id, {
      status: PaymentIntentStatus.SUCCEEDED,
      updatedAt: new Date(),
    });
  }

  private async loadIntent(id: string): Promise<PaymentIntent> {
    const row = await this.paymentIntentsRepository.findOne(id);
    return PaymentIntentMapper.toDomain(row);
  }

  private requireNetwork(token: Token, network: string): TokenNetwork {
    const deployment = token.networks[network];
    if (!deployment) throw new TokenNotOnNetworkException();
    return deployment;
  }

  private composeResponse(
    intent: PaymentIntent,
    quote: Quote,
    token: Token,
    network: TokenNetwork,
  ): PaymentIntentResponseDto {
    return {
      id: intent.id,
      status: intent.status,
      fromAddress: intent.fromAddress,
      merchantDomain: intent.merchantDomain,
      metadata: intent.metadata,
      txHash: intent.txHash,
      expiresAt: intent.expiresAt,
      createdAt: intent.createdAt,
      updatedAt: intent.updatedAt,
      quote: {
        id: quote.id,
        amount: quote.amount,
        currency: quote.currency,
        cryptoAmount: quote.cryptoAmount,
        rate: quote.rate,
        expiresAt: quote.expiresAt,
      },
      token: {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        network: quote.network,
        tokenAddress: network.tokenAddress,
        paymentAddress: network.paymentAddress,
        chainId: network.chain.id,
        confirmations: network.confirmations,
      },
    };
  }
}
