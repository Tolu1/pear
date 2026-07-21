import { Injectable } from '@nestjs/common';
import { and, eq, lt, sql } from 'drizzle-orm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type DrizzleAdapter } from '../drizzle/drizzle.module';
import { betaAccess } from './beta-access.schema';

@Injectable()
export class BetaAccessRepository {
  constructor(private readonly txHost: TransactionHost<DrizzleAdapter>) {}

  async findByCode(code: string) {
    const [row] = await this.txHost.tx
      .select()
      .from(betaAccess)
      .where(eq(betaAccess.code, code));
    return row;
  }

  async consumeOne(code: string) {
    const [row] = await this.txHost.tx
      .update(betaAccess)
      .set({ runsUsed: sql`${betaAccess.runsUsed} + 1` })
      .where(
        and(
          eq(betaAccess.code, code),
          eq(betaAccess.active, true),
          lt(betaAccess.runsUsed, betaAccess.runsGranted),
        ),
      )
      .returning();
    return row;
  }
}
