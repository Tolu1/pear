import path from 'node:path';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../../src/drizzle/schema';

export type TestDrizzleClient = NodePgDatabase<typeof schema>;

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  pool: Pool;
  db: TestDrizzleClient;
  url: string;
  stop: () => Promise<void>;
}

const MIGRATIONS_FOLDER = path.resolve(__dirname, '..', '..', 'migrations');

export async function startPostgresContainer(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('pear_test')
    .withUsername('pear')
    .withPassword('pear')
    .start();

  const url = container.getConnectionUri();
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema, casing: 'snake_case' });

  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  return {
    container,
    pool,
    db,
    url,
    async stop() {
      await pool.end();
      await container.stop();
    },
  };
}
