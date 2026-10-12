import { Injectable } from '@nestjs/common';
import { type VirtualCard } from './interfaces/virtual-card.interface';
import { VirtualCardMapper } from './virtual-card.mapper';
import { LasoService } from '../laso/laso.service';

@Injectable()
export class VirtualCardService {
  constructor(private readonly lasoService: LasoService) {}

  async issue(amount: string): Promise<string> {
    const cost = await this.lasoService.getIssuanceCost(amount);
    return this.lasoService.orderCard(cost);
  }

  async get(cardId: string): Promise<VirtualCard> {
    const card = await this.lasoService.getCard(cardId);
    return VirtualCardMapper.toDomain(card);
  }
}
