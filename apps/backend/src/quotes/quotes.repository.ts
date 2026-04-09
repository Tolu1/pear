import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { quotes } from './quotes.schema';
import { QuoteNotFoundException } from './exceptions/quote-not-found.exception';

@Injectable()
export class QuotesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: typeof quotes.$inferInsert) {
    const [quote] = await this.databaseService.db
      .insert(quotes)
      .values(data)
      .returning();
    return quote;
  }

  async findOne(id: string) {
    const [quote] = await this.databaseService.db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    if (!quote) throw new QuoteNotFoundException();
    return quote;
  }
}
