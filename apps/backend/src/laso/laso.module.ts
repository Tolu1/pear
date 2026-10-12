import { Module } from '@nestjs/common';
import { LasoService } from './laso.service';

@Module({
  providers: [LasoService],
  exports: [LasoService],
})
export class LasoModule {}
