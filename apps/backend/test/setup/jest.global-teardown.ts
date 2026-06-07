import type { TestDatabase } from '../utils/postgres-container';

export default async function globalTeardown(): Promise<void> {
  const db = (globalThis as Record<string, unknown>).__TEST_DB__ as
    | TestDatabase
    | undefined;
  if (db) {
    await db.stop();
  }
}
