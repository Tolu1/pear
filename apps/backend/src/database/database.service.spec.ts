import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn().mockReturnValue({ mockedDb: true }),
}));

jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn().mockReturnValue({ mockedSql: true }),
  neonConfig: {
    webSocketConstructor: null,
  },
}));

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('postgresql://test-url'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://test-url';

    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.db).toBeDefined();
  });
});
