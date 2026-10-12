import { PaymentIntentMapper } from './payment-intent.mapper';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { makeAddress, makeTxHash } from '../../test/factories';
import { makeQuote } from '../../test/factories';
import { makeTokenRail } from '../../test/factories';
import { makePaymentIntent } from '../../test/factories';

describe('PaymentIntentMapper', () => {
  describe('toDomain()', () => {
    it('combines an intent row with quote and rail to form the domain object', () => {
      const fromAddress = makeAddress();
      const txHash = makeTxHash();
      const quote = makeQuote();
      const rail = makeTokenRail();
      const row = {
        id: 'pi_1',
        quoteId: quote.id,
        railId: rail.id,
        status: PaymentIntentStatus.PROCESSING,
        fromAddress,
        merchantDomain: 'temu.com',
        metadata: { ref: 'abc' },
        txHash,
        cardId: 'card_123',
        expiresAt: new Date('2026-05-11T12:00:00Z'),
        createdAt: new Date('2026-05-11T11:00:00Z'),
        updatedAt: new Date('2026-05-11T11:30:00Z'),
      };

      const intent = PaymentIntentMapper.toDomain(row, quote, rail);

      expect(intent).toMatchObject({
        id: 'pi_1',
        status: PaymentIntentStatus.PROCESSING,
        fromAddress,
        merchantDomain: 'temu.com',
        metadata: { ref: 'abc' },
        txHash,
        cardId: 'card_123',
        quote,
        rail,
      });
    });
  });

  describe('toResponse()', () => {
    it('projects a domain intent to its response DTO', () => {
      const intent = makePaymentIntent();

      const response = PaymentIntentMapper.toResponse(intent);

      expect(response.id).toBe(intent.id);
      expect(response.status).toBe(intent.status);
      expect(response.quote.id).toBe(intent.quote.id);
      expect(response.rail.id).toBe(intent.rail.id);
    });

    it('omits the card id', () => {
      const intent = makePaymentIntent({ cardId: 'card_123' });

      const response = PaymentIntentMapper.toResponse(intent);

      expect(response).not.toHaveProperty('cardId');
    });

    it('omits internal rail fields like confirmations', () => {
      const intent = makePaymentIntent();

      const response = PaymentIntentMapper.toResponse(intent);

      expect(response.rail).not.toHaveProperty('confirmations');
    });

    it('omits the consumedAt field from the nested quote', () => {
      const intent = makePaymentIntent({
        quote: makeQuote({ consumedAt: new Date() }),
      });

      const response = PaymentIntentMapper.toResponse(intent);

      expect(response.quote).not.toHaveProperty('consumedAt');
    });
  });
});
