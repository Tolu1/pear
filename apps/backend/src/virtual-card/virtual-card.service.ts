import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type VirtualCard } from './interfaces/virtual-card.interface';
import { LasoService } from '../laso/laso.service';

const CARD_NAME = 'Pear';

@Injectable()
export class VirtualCardService {
  constructor(
    private readonly configService: ConfigService,
    private readonly lasoService: LasoService,
  ) {}

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
    };
  }

  issueCard(): VirtualCard {
    // TODO: replace with external card-issuing API call
    return {
      number: this.configService.getOrThrow<string>('CARD_NUMBER'),
      expiry: this.configService.getOrThrow<string>('CARD_EXPIRY'),
      cvv: this.configService.getOrThrow<string>('CARD_CVV'),
      name: this.configService.getOrThrow<string>('CARD_NAME'),
    };
  }
}
