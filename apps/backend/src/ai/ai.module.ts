import { Module } from '@nestjs/common';
import { AutomationController } from './ai.controller';
import { MagnitudeService } from './magnitude.service';

@Module({
  controllers: [AutomationController],
  providers: [MagnitudeService],
})
export class AiModule {}
