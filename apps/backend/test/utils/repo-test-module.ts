import { Test, TestingModule } from '@nestjs/testing';
import { Type } from '@nestjs/common';
import { ClsModule, ClsService } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { DrizzleModule, DRIZZLE } from '../../src/drizzle/drizzle.module';
import type { TestDrizzleClient } from './postgres-container';

export interface RepoTestModule<T> {
  module: TestingModule;
  repo: T;
  cls: ClsService;
  runInCls: <R>(fn: () => Promise<R> | R) => Promise<R>;
  close: () => Promise<void>;
}

export async function createRepoTestModule<T>(
  RepoClass: Type<T>,
  db: TestDrizzleClient,
): Promise<RepoTestModule<T>> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ClsModule.forRoot({
        plugins: [
          new ClsPluginTransactional({
            imports: [DrizzleModule],
            adapter: new TransactionalAdapterDrizzleOrm({
              drizzleInstanceToken: DRIZZLE,
            }),
          }),
        ],
      }),
    ],
    providers: [RepoClass],
  })
    .overrideProvider(DRIZZLE)
    .useValue(db)
    .compile();

  await moduleRef.init();

  const repo = moduleRef.get<T>(RepoClass);
  const cls = moduleRef.get(ClsService);

  return {
    module: moduleRef,
    repo,
    cls,
    runInCls: <R>(fn: () => Promise<R> | R) =>
      cls.run(() => Promise.resolve(fn())),
    close: () => moduleRef.close(),
  };
}
