import { startPostgresContainer } from '../utils/postgres-container';
import { applyTestEnv } from '../utils/env';

declare global {
  var __TEST_DB_URL__: string;
}

export default async function globalSetup(): Promise<void> {
  applyTestEnv();
  const db = await startPostgresContainer();
  process.env.DATABASE_URL = db.url;
  globalThis.__TEST_DB_URL__ = db.url;
  // Container is kept alive for the run; teardown stops it.
  (globalThis as Record<string, unknown>).__TEST_DB__ = db;
}
