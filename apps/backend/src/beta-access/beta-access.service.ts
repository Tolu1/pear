import { Injectable } from '@nestjs/common';
import { BetaAccessRepository } from './beta-access.repository';

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
    if (!row || !row.active) return { valid: false, remaining: 0, limit: 0 };
    return {
      valid: true,
      remaining: remainingOf(row.runLimit, row.runsUsed),
      limit: row.runLimit,
    };
  }

  async consume(code: string): Promise<ConsumeResult> {
    const row = await this.betaAccessRepository.consumeOne(normalize(code));
    if (!row) return { ok: false, remaining: 0, limit: 0 };
    return {
      ok: true,
      remaining: remainingOf(row.runLimit, row.runsUsed),
      limit: row.runLimit,
    };
  }
}

function normalize(code: string): string {
  return code.trim().toUpperCase();
}

function remainingOf(limit: number, used: number): number {
  return Math.max(0, limit - used);
}
