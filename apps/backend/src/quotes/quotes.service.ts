import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuotesRepository } from './quotes.repository';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

const QUOTE_TTL_MINUTES = 15;

@Injectable()
export class QuotesService {
  constructor(
    private readonly quotesRepository: QuotesRepository,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async create(dto: CreateQuoteDto) {
    const cryptoAmount = await this.exchangeRateService.convert(
      dto.amount,
      dto.currency,
      dto.tokenId,
    );

    const expiresAt = new Date(Date.now() + QUOTE_TTL_MINUTES * 60 * 1000);

    return this.quotesRepository.create({
      id: `qt_${uuidv4()}`,
      amount: dto.amount,
      currency: dto.currency,
      cryptoAmount,
      tokenId: dto.tokenId,
      blockchain: dto.blockchain,
      expiresAt,
    });
  }

  async findOne(id: string) {
    const quote = await this.quotesRepository.findOne(id);
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }
}
