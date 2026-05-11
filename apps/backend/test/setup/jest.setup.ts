import { Logger } from '@nestjs/common';

Logger.overrideLogger(false);

afterEach(() => {
  jest.clearAllMocks();
});
