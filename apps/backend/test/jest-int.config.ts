import type { Config } from 'jest';
import { swcJestConfig } from './setup/swc-jest.config';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  roots: ['<rootDir>/test/integration'],
  testRegex: '\\.int-spec\\.ts$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^mppx(/.*)?$': '<rootDir>/test/stubs/mppx.ts',
  },
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest', swcJestConfig],
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.ts'],
  globalSetup: '<rootDir>/test/setup/jest.global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/jest.global-teardown.ts',
  testEnvironment: 'node',
  maxWorkers: 1,
  testTimeout: 60_000,
};

export default config;
