import { accessCodeGuard } from './access-code.guard';
import { BetaAccessService } from './beta-access.service';

function makeReqRes(opts: { method?: string; path?: string; code?: string }) {
  const req = {
    method: opts.method ?? 'POST',
    path: opts.path ?? '/start',
    header: (name: string) =>
      name === 'x-access-code' ? opts.code : undefined,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

function makeService(consume: jest.Mock): BetaAccessService {
  return { consume } as unknown as BetaAccessService;
}

describe('accessCodeGuard', () => {
  it('passes non-start requests straight through without consuming', async () => {
    const consume = jest.fn();
    const { req, res, next } = makeReqRes({ path: '/step' });

    await accessCodeGuard(makeService(consume))(
      req as never,
      res as never,
      next,
    );

    expect(consume).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('consumes and continues when a run is allowed', async () => {
    const consume = jest
      .fn()
      .mockResolvedValue({ ok: true, remaining: 5, limit: 25 });
    const { req, res, next } = makeReqRes({ code: 'PEAR-TEST' });

    await accessCodeGuard(makeService(consume))(
      req as never,
      res as never,
      next,
    );

    expect(consume).toHaveBeenCalledWith('PEAR-TEST');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks with 402 when out of runs', async () => {
    const consume = jest
      .fn()
      .mockResolvedValue({ ok: false, remaining: 0, limit: 25 });
    const { req, res, next } = makeReqRes({ code: 'PEAR-TEST' });

    await accessCodeGuard(makeService(consume))(
      req as never,
      res as never,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({ error: 'OUT_OF_RUNS' });
    expect(next).not.toHaveBeenCalled();
  });

  it('fails open when the counter is unreachable', async () => {
    const consume = jest.fn().mockRejectedValue(new Error('down'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { req, res, next } = makeReqRes({ code: 'PEAR-TEST' });

    await accessCodeGuard(makeService(consume))(
      req as never,
      res as never,
      next,
    );

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
