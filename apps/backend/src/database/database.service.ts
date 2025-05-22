import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';
import * as schema from './database.schema';

neonConfig.webSocketConstructor = ws;

@Injectable()
export class DatabaseService {
  public readonly db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle({ client: sql });
  }
}
