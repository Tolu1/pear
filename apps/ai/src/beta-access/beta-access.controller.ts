import { Body, Controller, Post } from '@nestjs/common';
import { BetaAccessService } from './beta-access.service';
import { BetaAccessCodeDto } from './dto/beta-access-code.dto';

@Controller('beta-access')
export class BetaAccessController {
  constructor(private readonly betaAccessService: BetaAccessService) {}

  @Post('validate')
  validate(@Body() dto: BetaAccessCodeDto) {
    return this.betaAccessService.validate(dto.code);
  }
}
