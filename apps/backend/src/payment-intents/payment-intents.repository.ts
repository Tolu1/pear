import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DrizzleTxHost } from '../drizzle/drizzle.module';
import { paymentIntents } from './payment-intents.schema';
import { PaymentIntentNotFoundException } from './exceptions/payment-intent-not-found.exception';

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

  async update(id: string, data: Partial<typeof paymentIntents.$inferInsert>) {
    const [intent] = await this.txHost.tx
      .update(paymentIntents)
      .set(data)
      .where(eq(paymentIntents.id, id))
      .returning();
    if (!intent) throw new PaymentIntentNotFoundException();
    return intent;
  }
}
