import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { type VirtualCard } from './interfaces/virtual-card.interface';
import { type CardCost } from './interfaces/card-cost.interface';
import { VirtualCardMapper } from './virtual-card.mapper';
import { LasoService } from '../laso/laso.service';

@Injectable()
export class VirtualCardService {
  private readonly demoCardId: string | undefined;

  constructor(
    private readonly lasoService: LasoService,
    configService: ConfigService,
  ) {
    this.demoCardId = configService.get<string>('DEMO_CARD_ID');
  }

  async getCost(amount: string): Promise<CardCost> {
    if (this.demoCardId) return { fee: '0', total: amount };

    const { fee, total } = await this.lasoService.getIssuanceCost(amount);
    return { fee, total };
  }

  async issue(amount: string, fee: string): Promise<string> {
    if (this.demoCardId) return this.demoCardId;

    const total = new Decimal(amount).plus(fee).toString();
    return this.lasoService.orderCard({ amount, fee, total });
  }

  async get(cardId: string): Promise<VirtualCard> {
    const card = await this.lasoService.getCard(cardId);
    return VirtualCardMapper.toDomain(card);
  }
}
