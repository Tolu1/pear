import { Module } from '@nestjs/common';
import { BamlService } from './baml.service';
import { BamlController } from './baml.controller';
import { CoordinateModule } from '../coordinate/coordinate.module';

@Module({
  imports: [CoordinateModule],
  controllers: [BamlController],
  providers: [BamlService],
})
export class BamlModule {}
