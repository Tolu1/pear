import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { paymentIntents } from '../database/database.schema';
import {
  type NewPaymentIntent,
  type PaymentIntentStatus,
} from '../database/database.types';
import { type Blockchain } from '../common/constants/supported-tokens.constant';

@Injectable()
export class PaymentIntentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(data: NewPaymentIntent) {
    const [intent] = await this.drizzleService.db
      .insert(paymentIntents)
      .values(data)
      .returning();
    return intent;
  }

  async findOne(id: string) {
    const [intent] = await this.drizzleService.db
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.id, id));
    return intent ?? null;
  }

  async findPendingByFromAddress(fromAddress: string, blockchain: Blockchain) {
    const [intent] = await this.drizzleService.db
      .select()
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.fromAddress, fromAddress),
          eq(paymentIntents.blockchain, blockchain),
          eq(paymentIntents.status, 'requires_transfer'),
        ),
      );
    return intent ?? null;
  }

  async updateStatus(id: string, status: PaymentIntentStatus) {
    const [intent] = await this.drizzleService.db
      .update(paymentIntents)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentIntents.id, id))
      .returning();
    return intent;
  }
}
