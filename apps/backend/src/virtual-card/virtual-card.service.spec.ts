import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VirtualCardService } from './virtual-card.service';
import { LasoService } from '../laso/laso.service';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

describe('VirtualCardService', () => {
  let service: VirtualCardService;
  let configService: DeepMocked<ConfigService>;
  let lasoService: DeepMocked<LasoService>;

  beforeEach(async () => {
    configService = createMock<ConfigService>();
    configService.getOrThrow.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        CARD_NUMBER: '4242424242424242',
        CARD_EXPIRY: '12/30',
        CARD_CVV: '123',
        CARD_NAME: 'Test Holder',
      };
      return map[key];
    });
    lasoService = createMock<LasoService>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        VirtualCardService,
        { provide: ConfigService, useValue: configService },
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
      });
    });
  });

  describe('issueCard()', () => {
    it('returns the card details from configuration', () => {
      const card = service.issueCard();

      expect(card).toEqual({
        number: '4242424242424242',
        expiry: '12/30',
        cvv: '123',
        name: 'Test Holder',
      });
    });

    it('propagates errors when a card env var is missing', () => {
      configService.getOrThrow.mockImplementation(() => {
        throw new Error('CARD_NUMBER is not defined');
      });

      expect(() => service.issueCard()).toThrow('CARD_NUMBER is not defined');
    });
  });
});
