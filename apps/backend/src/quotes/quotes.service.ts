import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuotesRepository } from './quotes.repository';
import { QuoteMapper } from './quote.mapper';
import { FiatToCryptoService } from '../rates/fiat-to-crypto.service';
import { Quote } from './interfaces/quote.interface';
import { QuoteExpiredException } from './exceptions/quote-expired.exception';
import { QuoteAlreadyConsumedException } from './exceptions/quote-already-consumed.exception';

const QUOTE_TTL_MINUTES = 15;

@Injectable()
export class QuotesService {
  constructor(
    private readonly quotesRepository: QuotesRepository,
    private readonly fiatToCryptoService: FiatToCryptoService,
  ) {}

  async create(dto: CreateQuoteDto): Promise<Quote> {
    const { cryptoAmount, rate } = await this.fiatToCryptoService.convert(
      dto.amount,
      dto.currency,
      dto.tokenId,
    );

    const expiresAt = new Date(Date.now() + QUOTE_TTL_MINUTES * 60 * 1000);

    const quote = await this.quotesRepository.create({
      id: `qt_${uuidv4()}`,
      amount: dto.amount,
      currency: dto.currency,
      cryptoAmount,
      rate,
      tokenId: dto.tokenId,
      network: dto.network,
      expiresAt,
    });

    return QuoteMapper.toDomain(quote);
  }

  async findOne(id: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne(id);
    return QuoteMapper.toDomain(quote);
  }

  async findActive(id: string): Promise<Quote> {
    const quote = await this.findOne(id);
    if (quote.consumedAt) throw new QuoteAlreadyConsumedException();
    if (new Date() > quote.expiresAt) throw new QuoteExpiredException();
    return quote;
  }

  async markConsumed(id: string): Promise<void> {
    await this.quotesRepository.update(id, { consumedAt: new Date() });
  }
}
