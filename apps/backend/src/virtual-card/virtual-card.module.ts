import { Module } from '@nestjs/common';
import { VirtualCardService } from './virtual-card.service';
import { LasoModule } from '../laso/laso.module';

@Module({
  imports: [LasoModule],
  providers: [VirtualCardService],
  exports: [VirtualCardService],
})
export class VirtualCardModule {}
