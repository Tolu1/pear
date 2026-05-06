import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;

export const DRIZZLE: symbol = Symbol('DRIZZLE');

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

export type DrizzleTxHost = TransactionHost<
  TransactionalAdapterDrizzleOrm<DrizzleClient>
>;

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DrizzleClient => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        const sql = neon(databaseUrl);
        return drizzle({ client: sql, schema, casing: 'snake_case' });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
