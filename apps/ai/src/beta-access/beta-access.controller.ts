import { Body, Controller, Post } from '@nestjs/common';
import { BetaAccessService } from './beta-access.service';

@Controller('beta-access')
export class BetaAccessController {
  constructor(private readonly betaAccessService: BetaAccessService) {}

  @Post('validate')
  validate(@Body('code') code: string) {
    return this.betaAccessService.validate(code ?? '');
  }
}
