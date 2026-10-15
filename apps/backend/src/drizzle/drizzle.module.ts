import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;

export const DRIZZLE: symbol = Symbol('DRIZZLE');

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

export type DrizzleAdapter = TransactionalAdapterDrizzleOrm<DrizzleClient>;

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DrizzleClient => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        const pool = new Pool({ connectionString: databaseUrl });
        return drizzle({ client: pool, schema, casing: 'snake_case' });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
