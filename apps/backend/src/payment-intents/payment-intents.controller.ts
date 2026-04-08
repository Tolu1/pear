import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
@Controller('payment-intents')
export class PaymentIntentsController {
  constructor(private readonly paymentIntentsService: PaymentIntentsService) {}

  @Post()
  create(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentIntentsService.create(createPaymentIntentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentIntentsService.findOne(id);
  }

  @Get(':id/status')
  async getStatus(
    @Param('id') id: string,
  ): Promise<{ id: string; status: string }> {
    const intent = await this.paymentIntentsService.findOne(id);
    return { id: intent.id, status: intent.status };
  }
}
