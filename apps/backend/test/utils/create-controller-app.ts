import { INestApplication, Type, ValidationPipe } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { useContainer } from 'class-validator';

export interface ControllerAppOptions {
  controllers: Type[];
  providers: { provide: unknown; useValue: unknown }[];
  customise?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
}

export async function createControllerApp(
  options: ControllerAppOptions,
): Promise<INestApplication> {
  let builder = Test.createTestingModule({
    controllers: options.controllers,
    providers: options.providers as never,
  });

  if (options.customise) {
    builder = options.customise(builder);
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ logger: false });
  app.setGlobalPrefix('v1', { exclude: ['health'] });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app, { fallbackOnErrors: true });
  await app.init();

  return app;
}
