import { sql } from 'drizzle-orm';
import type { TestDrizzleClient } from './postgres-container';

const TABLES = ['payment_intents', 'quotes'] as const;

export async function truncateAll(db: TestDrizzleClient): Promise<void> {
  await db.execute(
    sql.raw(`TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`),
  );
}
