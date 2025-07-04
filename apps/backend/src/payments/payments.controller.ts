import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      return await this.paymentsService.create(createPaymentDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.paymentsService.findOne(id);
    } catch (error) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/status')
  async getPaymentStatus(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);
    return {
      id: payment.id,
      status: payment.status,
    };
  }

  @Sse(':id/events')
  subscribeToPaymentEvents(@Param('id') id: string) {
    return this.paymentsService.subscribeToPaymentEvents(id);
  }
}
