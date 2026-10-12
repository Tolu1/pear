import { Test } from '@nestjs/testing';
import { VirtualCardService } from './virtual-card.service';
import { LasoService } from '../laso/laso.service';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

describe('VirtualCardService', () => {
  let service: VirtualCardService;
  let lasoService: DeepMocked<LasoService>;

  beforeEach(async () => {
    lasoService = createMock<LasoService>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        VirtualCardService,
        { provide: LasoService, useValue: lasoService },
      ],
    }).compile();

    service = moduleRef.get(VirtualCardService);
  });

  describe('issue()', () => {
    it('orders a card at the cost Laso quotes and returns its id', async () => {
      const cost = { amount: '50', fee: '0', total: '50' };
      lasoService.getIssuanceCost.mockResolvedValue(cost);
      lasoService.orderCard.mockResolvedValue('card_123');

      const cardId = await service.issue('50');

      expect(lasoService.getIssuanceCost).toHaveBeenCalledWith('50');
      expect(lasoService.orderCard).toHaveBeenCalledWith(cost);
      expect(cardId).toBe('card_123');
    });
  });

  describe('get()', () => {
    it("maps Laso's card to Pear's card", async () => {
      lasoService.getCard.mockResolvedValue({
        cardId: 'card_123',
        usdAmount: 50,
        cardNumber: '4111111111111111',
        expMonth: '7',
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

      const card = await service.get('card_123');

      expect(lasoService.getCard).toHaveBeenCalledWith('card_123');
      expect(card).toEqual({
        number: '4111111111111111',
        expiry: '07/27',
        cvv: '123',
        name: 'Pear',
        billingAddress: {
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
});
