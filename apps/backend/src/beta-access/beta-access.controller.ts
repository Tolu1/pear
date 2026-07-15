import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ServiceAuthGuard } from '../common/guards/service-auth.guard';
import { BetaAccessService } from './beta-access.service';
import { BetaAccessCodeDto } from './dto/beta-access-code.dto';

@Controller('beta-access')
@UseGuards(ServiceAuthGuard)
@ApiSecurity('service-api-key')
@ApiUnauthorizedResponse({ description: 'Missing or invalid service API key' })
export class BetaAccessController {
  constructor(private readonly betaAccessService: BetaAccessService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Check whether an access code is valid and how many runs remain',
    description: 'Service-to-service endpoint. Does not consume a run.',
  })
  validate(@Body() dto: BetaAccessCodeDto) {
    return this.betaAccessService.validate(dto.code);
  }

  @Post('consume')
  @ApiOperation({
    summary: 'Consume one run for an access code',
    description:
      'Service-to-service endpoint. Called by the AI service on run start; deducts one run.',
  })
  consume(@Body() dto: BetaAccessCodeDto) {
    return this.betaAccessService.consume(dto.code);
  }
}
