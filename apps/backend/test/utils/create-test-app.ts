import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { AppModule } from '../../src/app.module';
import { DRIZZLE } from '../../src/drizzle/drizzle.module';
import type { TestDrizzleClient } from './postgres-container';

export interface CreateTestAppOptions {
  db: TestDrizzleClient;
  databaseUrl: string;
  customise?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
}

export async function createTestApp(
  options: CreateTestAppOptions,
): Promise<INestApplication> {
  process.env.DATABASE_URL = options.databaseUrl;

  let builder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DRIZZLE)
    .useValue(options.db);

  if (options.customise) {
    builder = options.customise(builder);
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ rawBody: true });
  app.setGlobalPrefix('v1', { exclude: ['health'] });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.init();

  return app;
}
