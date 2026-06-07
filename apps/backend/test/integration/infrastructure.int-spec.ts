import { sql } from 'drizzle-orm';
import type { TestDatabase } from '../utils/postgres-container';
import { truncateAll } from '../utils/truncate';

describe('test infrastructure', () => {
  let testDb: TestDatabase;

  beforeAll(() => {
    testDb = (globalThis as Record<string, unknown>)
      .__TEST_DB__ as TestDatabase;
  });

  it('boots Postgres testcontainer with a connection URL', () => {
    expect(testDb).toBeDefined();
    expect(testDb.url).toMatch(/^postgres:\/\//);
  });

  it('runs Drizzle migrations and creates expected tables', async () => {
    const result = await testDb.db.execute(sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tableNames = result.rows.map((row) => row.table_name as string);

    expect(tableNames).toEqual(
      expect.arrayContaining(['payment_intents', 'quotes']),
    );
  });

  it('truncates all tables cleanly', async () => {
    await truncateAll(testDb.db);

    const { rows: quoteRows } = await testDb.db.execute(
      sql`SELECT COUNT(*)::int AS count FROM quotes`,
    );
    const { rows: intentRows } = await testDb.db.execute(
      sql`SELECT COUNT(*)::int AS count FROM payment_intents`,
    );

    expect(quoteRows[0].count).toBe(0);
    expect(intentRows[0].count).toBe(0);
  });
});
