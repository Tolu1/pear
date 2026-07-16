import type { Request, Response, NextFunction } from 'express';
import { BetaAccessService } from './beta-access.service';

export function accessCodeGuard(betaAccessService: BetaAccessService) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const isStart =
      req.method === 'POST' &&
      (req.path === '/start' || req.path === '/agent/start');
    if (!isStart) return next();

    const code = req.header('x-access-code') ?? '';
    try {
      const { ok } = await betaAccessService.consume(code);
      if (!ok) {
        res.status(402).json({ error: 'OUT_OF_RUNS' });
        return;
      }
    } catch (error) {
      console.warn('[access-code] access check unavailable, refusing run:', error);
      res.status(503).json({ error: 'ACCESS_CHECK_UNAVAILABLE' });
      return;
    }
    next();
  };
}
