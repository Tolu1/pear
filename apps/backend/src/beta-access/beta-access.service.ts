import { Injectable } from '@nestjs/common';
import { BetaAccessRepository } from './beta-access.repository';
import { MAX_RUNS } from './beta-access.constants';

export interface ValidateResult {
  valid: boolean;
  remaining: number;
  limit: number;
}

export interface ConsumeResult {
  ok: boolean;
  remaining: number;
  limit: number;
}

@Injectable()
export class BetaAccessService {
  constructor(private readonly betaAccessRepository: BetaAccessRepository) {}

  async validate(code: string): Promise<ValidateResult> {
    const row = await this.betaAccessRepository.findByCode(normalize(code));
    if (!row || !row.active)
      return { valid: false, remaining: 0, limit: MAX_RUNS };
    return {
      valid: true,
      remaining: remainingOf(row.runsGranted, row.runsUsed),
      limit: MAX_RUNS,
    };
  }

  async consume(code: string): Promise<ConsumeResult> {
    const row = await this.betaAccessRepository.consumeOne(normalize(code));
    if (!row) return { ok: false, remaining: 0, limit: MAX_RUNS };
    return {
      ok: true,
      remaining: remainingOf(row.runsGranted, row.runsUsed),
      limit: MAX_RUNS,
    };
  }
}

function normalize(code: string): string {
  return code.trim().toUpperCase();
}

function remainingOf(granted: number, used: number): number {
  return Math.max(0, granted - used);
}
