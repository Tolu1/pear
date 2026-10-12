import { type VirtualCard } from './interfaces/virtual-card.interface';
import { type LasoCard } from '../laso/interfaces/laso-card.interface';

const CARD_NAME = 'Pear';

export class VirtualCardMapper {
  static toDomain(card: LasoCard): VirtualCard {
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
