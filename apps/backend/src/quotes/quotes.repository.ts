import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { quotes } from '../database/database.schema';
import { type NewQuote } from '../database/database.types';

@Injectable()
export class QuotesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(data: NewQuote) {
    const [quote] = await this.drizzleService.db
      .insert(quotes)
      .values(data)
      .returning();
    return quote;
  }

  async findOne(id: string) {
    const [quote] = await this.drizzleService.db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    return quote ?? null;
  }
}
