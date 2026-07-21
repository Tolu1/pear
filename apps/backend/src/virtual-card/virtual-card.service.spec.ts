import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VirtualCardService } from './virtual-card.service';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

describe('VirtualCardService', () => {
  let service: VirtualCardService;
  let configService: DeepMocked<ConfigService>;

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

    const moduleRef = await Test.createTestingModule({
      providers: [
        VirtualCardService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(VirtualCardService);
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
