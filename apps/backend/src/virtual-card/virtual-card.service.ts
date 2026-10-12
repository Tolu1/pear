import { Injectable } from '@nestjs/common';
import { type VirtualCard } from './interfaces/virtual-card.interface';
import { LasoService } from '../laso/laso.service';

const CARD_NAME = 'Pear';

@Injectable()
export class VirtualCardService {
  constructor(private readonly lasoService: LasoService) {}

  async issue(amount: string): Promise<string> {
    const cost = await this.lasoService.getIssuanceCost(amount);
    return this.lasoService.orderCard(cost);
  }

  async get(cardId: string): Promise<VirtualCard> {
    const card = await this.lasoService.getCard(cardId);
    return {
      number: card.cardNumber,
      expiry: `${card.expMonth.padStart(2, '0')}/${card.expYear.slice(-2)}`,
      cvv: card.cvv,
      name: CARD_NAME,
      billingAddress: {
        line1: card.billingAddress.line1,
        line2: card.billingAddress.line2,
        city: card.billingAddress.city,
        state: card.billingAddress.state,
        zip: card.billingAddress.zip,
        country: card.billingAddress.country,
      },
    };
  }
}
