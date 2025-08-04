import { Module } from '@nestjs/common';
import { CoordinateService } from './coordinate.service';

@Module({
  providers: [CoordinateService],
  exports: [CoordinateService],
})
export class CoordinateModule {}
