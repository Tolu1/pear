import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { type VirtualCard } from './interfaces/virtual-card.interface';
import { type CardCost } from './interfaces/card-cost.interface';
import { VirtualCardMapper } from './virtual-card.mapper';
import { LasoService } from '../laso/laso.service';

@Injectable()
export class VirtualCardService {
  constructor(private readonly lasoService: LasoService) {}

  async getCost(amount: string): Promise<CardCost> {
    const { fee, total } = await this.lasoService.getIssuanceCost(amount);
    return { fee, total };
  }

  async issue(amount: string, fee: string): Promise<string> {
    const total = new Decimal(amount).plus(fee).toString();
    return this.lasoService.orderCard({ amount, fee, total });
  }

  async get(cardId: string): Promise<VirtualCard> {
    const card = await this.lasoService.getCard(cardId);
    return VirtualCardMapper.toDomain(card);
  }
}
