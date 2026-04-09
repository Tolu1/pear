import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a quote for a fiat amount and token pair' })
  create(@Body() createQuoteDto: CreateQuoteDto): Promise<QuoteResponseDto> {
    return this.quotesService.create(createQuoteDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by id' })
  @ApiNotFoundResponse({ description: 'Quote not found' })
  findOne(@Param('id') id: string): Promise<QuoteResponseDto> {
    return this.quotesService.findOne(id);
  }
}
