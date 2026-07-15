import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BetaAccessService } from './beta-access.service';

describe('BetaAccessService', () => {
  let service: BetaAccessService;
  const fetchMock = jest.fn();

  beforeEach(async () => {
    global.fetch = fetchMock as never;
    fetchMock.mockReset();

    const configService = {
      getOrThrow: (key: string) =>
        key === 'BACKEND_URL' ? 'http://backend/v1' : 'service-key',
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        BetaAccessService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(BetaAccessService);
  });

  it('validates by posting the code with the service key', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, remaining: 18, limit: 25 }),
    });

    const result = await service.validate('PEAR-TEST');

    expect(result).toEqual({ valid: true, remaining: 18, limit: 25 });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend/v1/beta-access/validate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-service-api-key': 'service-key' }),
        body: JSON.stringify({ code: 'PEAR-TEST' }),
      }),
    );
  });

  it('consumes through the consume endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, remaining: 17, limit: 25 }),
    });

    const result = await service.consume('PEAR-TEST');

    expect(result).toEqual({ ok: true, remaining: 17, limit: 25 });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend/v1/beta-access/consume',
      expect.anything(),
    );
  });

  it('throws when the backend responds with a non-ok status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    await expect(service.validate('PEAR-TEST')).rejects.toThrow(
      'beta-access validate failed: 500',
    );
  });
});
