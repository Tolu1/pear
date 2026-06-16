import { Body, Controller, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { StartCheckoutDto } from './dto/start-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post()
  async start(@Body() dto: StartCheckoutDto): Promise<{ sessionId: string }> {
    const sessionId = await this.checkout.start(dto.intentId);
    return { sessionId };
  }
}
