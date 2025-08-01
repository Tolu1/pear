import { Module } from '@nestjs/common';
import { BamlService } from './baml.service';
import { BamlController } from './baml.controller';

@Module({
  controllers: [BamlController],
  providers: [BamlService],
})
export class BamlModule {}
