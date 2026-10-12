import { LasoMapper } from './laso.mapper';

describe('LasoMapper.toDomain()', () => {
  it("maps Laso's card response to a LasoCard", () => {
    const details = {
      card_number: '4111111111111111',
      exp_month: '12',
      exp_year: '2027',
      cvv: '123',
      billing_address: {
        name: 'Laso Finance',
        line_1: '440 N Barranca Avenue',
        line_2: '#4496',
        city: 'Covina',
        state: 'CA',
        zip: '91723',
        country: 'US',
      },
    };
    const data = {
      card_id: 'card_123',
      status: 'ready',
      usd_amount: 50,
      card_details: details,
    };

    expect(LasoMapper.toDomain(data, details)).toEqual({
      cardId: 'card_123',
      usdAmount: 50,
      cardNumber: '4111111111111111',
      expMonth: '12',
      expYear: '2027',
      cvv: '123',
      billingAddress: {
        name: 'Laso Finance',
        line1: '440 N Barranca Avenue',
        line2: '#4496',
        city: 'Covina',
        state: 'CA',
        zip: '91723',
        country: 'US',
      },
    });
  });
});
