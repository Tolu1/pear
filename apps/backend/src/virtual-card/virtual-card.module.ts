import { Module } from '@nestjs/common';
import { VirtualCardService } from './virtual-card.service';

@Module({
  providers: [VirtualCardService],
  exports: [VirtualCardService],
})
export class VirtualCardModule {}
