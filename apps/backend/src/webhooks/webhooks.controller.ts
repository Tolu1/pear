import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { type MoralisWebhook } from './interfaces/moralis-webhook.interface';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('moralis')
  @HttpCode(200)
  handleMoralis(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: MoralisWebhook,
    @Headers('x-signature') signature: string,
  ): Promise<void> {
    return this.webhooksService.handleMoralisWebhook(
      req.rawBody,
      body,
      signature,
    );
  }
}
