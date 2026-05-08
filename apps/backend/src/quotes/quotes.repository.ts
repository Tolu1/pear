import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DrizzleTxHost } from '../drizzle/drizzle.module';
import { quotes } from './quotes.schema';
import { QuoteNotFoundException } from './exceptions/quote-not-found.exception';

@Injectable()
export class QuotesRepository {
  constructor(private readonly txHost: DrizzleTxHost) {}

  async create(data: typeof quotes.$inferInsert) {
    const [quote] = await this.txHost.tx
      .insert(quotes)
      .values(data)
      .returning();
    return quote;
  }

  async findOne(id: string) {
    const [quote] = await this.txHost.tx
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    if (!quote) throw new QuoteNotFoundException();
    return quote;
  }

  async update(id: string, data: Partial<typeof quotes.$inferInsert>) {
    const [quote] = await this.txHost.tx
      .update(quotes)
      .set(data)
      .where(eq(quotes.id, id))
      .returning();
    if (!quote) throw new QuoteNotFoundException();
    return quote;
  }
}
