import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private databaseService: DatabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getTable(name: string): Promise<any[]> {
    return await this.databaseService.db`SELECT * FROM playing_with_neon`;
  }
}
