import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { type Hash } from 'viem';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentMapper } from './payment-intent.mapper';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { SubmitPaymentIntentDto } from './dto/submit-payment-intent.dto';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { PaymentIntentStatusResponseDto } from './dto/payment-intent-status-response.dto';
import { VirtualCardResponseDto } from '../virtual-card/dto/virtual-card-response.dto';

@Controller('payment-intents')
export class PaymentIntentsController {
  constructor(private readonly paymentIntentsService: PaymentIntentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment intent from a quote' })
  @ApiNotFoundResponse({ description: 'Quote not found' })
  @ApiBadRequestResponse({
    description: 'Quote has expired or token is unsupported on the network',
  })
  async create(
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    const intent = await this.paymentIntentsService.create(dto);
    return PaymentIntentMapper.toResponse(intent);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment intent by id' })
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  async findOne(@Param('id') id: string): Promise<PaymentIntentResponseDto> {
    const intent = await this.paymentIntentsService.findOne(id);
    return PaymentIntentMapper.toResponse(intent);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get the current status of a payment intent' })
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  async getStatus(
    @Param('id') id: string,
  ): Promise<PaymentIntentStatusResponseDto> {
    const intent = await this.paymentIntentsService.findOne(id);
    return { id: intent.id, status: intent.status };
  }

  @Get(':id/card')
  @ApiOperation({
    summary: 'Get virtual card details for a processing payment intent',
  })
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  @ApiForbiddenResponse({ description: 'Card details not available' })
  getCard(@Param('id') id: string): Promise<VirtualCardResponseDto> {
    return this.paymentIntentsService.getCard(id);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit the on-chain transaction hash for a payment intent',
  })
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  @ApiConflictResponse({
    description: 'Payment intent is not in requires_transfer state',
  })
  @ApiBadRequestResponse({
    description: 'Transaction does not match the expected transfer',
  })
  @ApiUnprocessableEntityResponse({
    description: 'On-chain transfer did not succeed',
  })
  async submit(
    @Param('id') id: string,
    @Body() dto: SubmitPaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    const intent = await this.paymentIntentsService.submit(
      id,
      dto.txHash as Hash,
    );
    return PaymentIntentMapper.toResponse(intent);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a processing payment intent as completed' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  @ApiConflictResponse({
    description: 'Payment intent is not in processing state',
  })
  complete(@Param('id') id: string): Promise<void> {
    return this.paymentIntentsService.complete(id);
  }
}
