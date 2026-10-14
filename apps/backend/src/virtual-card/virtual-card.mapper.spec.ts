import { VirtualCardMapper } from './virtual-card.mapper';

describe('VirtualCardMapper.toDomain()', () => {
  it("maps a Laso card and its cardholder to Pear's card", () => {
    const card = {
      cardId: 'card_123',
      usdAmount: 50,
      cardNumber: '4111111111111111',
      expMonth: '7',
      expYear: '2027',
      cvv: '123',
      billingAddress: {
        name: 'Laso Finance',
        line1: '440 N Barranca Avenue',
        line2: null,
        city: 'Covina',
        state: 'CA',
        zip: '91723',
        country: 'US',
      },
    };

    const cardholder = { name: 'Pear Card', email: 'admin@pearextension.com' };

    expect(VirtualCardMapper.toDomain(card, cardholder)).toEqual({
      number: '4111111111111111',
      expiry: '07/27',
      cvv: '123',
      name: 'Pear Card',
      billingEmail: 'admin@pearextension.com',
      billingAddress: {
        line1: '440 N Barranca Avenue',
        line2: null,
        city: 'Covina',
        state: 'CA',
        zip: '91723',
        country: 'US',
      },
    });
  });
});
