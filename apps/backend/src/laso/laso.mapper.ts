import { type LasoCard } from './interfaces/laso-card.interface';
import {
  type LasoCardApiResponse,
  type LasoCardDetails,
} from './interfaces/laso-card-api-response.interface';

export class LasoMapper {
  static toDomain(
    data: LasoCardApiResponse,
    details: LasoCardDetails,
  ): LasoCard {
    const address = details.billing_address;
    return {
      cardId: data.card_id,
      usdAmount: data.usd_amount,
      cardNumber: details.card_number,
      expMonth: details.exp_month,
      expYear: details.exp_year,
      cvv: details.cvv,
      billingAddress: {
        name: address.name,
        line1: address.line_1,
        line2: address.line_2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      },
    };
  }
}
