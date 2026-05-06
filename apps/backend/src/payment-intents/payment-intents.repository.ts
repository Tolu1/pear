import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type DrizzleTxHost } from '../drizzle/drizzle.module';
import { paymentIntents } from './payment-intents.schema';
import { PaymentIntentNotFoundException } from './exceptions/payment-intent-not-found.exception';
import { type Blockchain } from '../common/constants/supported-tokens.constant';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';

@Injectable()
export class PaymentIntentsRepository {
  constructor(private readonly txHost: DrizzleTxHost) {}

  async create(data: typeof paymentIntents.$inferInsert) {
    const [intent] = await this.txHost.tx
      .insert(paymentIntents)
      .values(data)
      .returning();
    return intent;
  }

  async findOne(id: string) {
    const [intent] = await this.txHost.tx
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.id, id));
    if (!intent) throw new PaymentIntentNotFoundException();
    return intent;
  }

  async findPendingByFromAddress(fromAddress: string, blockchain: Blockchain) {
    const [intent] = await this.txHost.tx
      .select()
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.fromAddress, fromAddress),
          eq(paymentIntents.blockchain, blockchain),
          eq(paymentIntents.status, PaymentIntentStatus.REQUIRES_TRANSFER),
        ),
      );
    return intent ?? null;
  }

  async updateStatus(
    id: string,
    status: (typeof paymentIntents.$inferSelect)['status'],
  ) {
    const [intent] = await this.txHost.tx
      .update(paymentIntents)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentIntents.id, id))
      .returning();
    return intent;
  }
}
