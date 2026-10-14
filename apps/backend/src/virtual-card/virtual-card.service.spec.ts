import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VirtualCardService } from './virtual-card.service';
import { LasoService } from '../laso/laso.service';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

describe('VirtualCardService', () => {
  let service: VirtualCardService;
  let lasoService: DeepMocked<LasoService>;

  async function createService(demoCardId?: string) {
    const configService = createMock<ConfigService>();
    configService.get.mockReturnValue(demoCardId);

    const moduleRef = await Test.createTestingModule({
      providers: [
        VirtualCardService,
        { provide: LasoService, useValue: lasoService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    return moduleRef.get(VirtualCardService);
  }

  beforeEach(async () => {
    lasoService = createMock<LasoService>();
    service = await createService();
  });

  describe('demo mode', () => {
    it('prices the card at the amount with no fee, without calling Laso', async () => {
      service = await createService('card_demo');

      expect(await service.getCost('1')).toEqual({ fee: '0', total: '1' });
      expect(lasoService.getIssuanceCost).not.toHaveBeenCalled();
    });

    it('reuses the demo card instead of buying one', async () => {
      service = await createService('card_demo');

      expect(await service.issue('1', '0')).toBe('card_demo');
      expect(lasoService.orderCard).not.toHaveBeenCalled();
    });
  });

  describe('getCost()', () => {
    it("returns the fee and total from Laso's price quote", async () => {
      lasoService.getIssuanceCost.mockResolvedValue({
        amount: '50',
        fee: '1.2',
        total: '51.2',
      });

      expect(await service.getCost('50')).toEqual({
        fee: '1.2',
        total: '51.2',
      });
      expect(lasoService.getIssuanceCost).toHaveBeenCalledWith('50');
    });
  });

  describe('issue()', () => {
    it('orders a card capped at the amount plus the quoted fee', async () => {
      lasoService.orderCard.mockResolvedValue('card_123');

      const cardId = await service.issue('50', '1.2');

      expect(lasoService.orderCard).toHaveBeenCalledWith({
        amount: '50',
        fee: '1.2',
        total: '51.2',
      });
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
