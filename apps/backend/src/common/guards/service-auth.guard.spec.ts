import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceAuthGuard } from './service-auth.guard';
import { createMock, DeepMocked } from '../../../test/utils/create-mock';

describe('ServiceAuthGuard', () => {
  let guard: ServiceAuthGuard;
  let configService: DeepMocked<ConfigService>;

  beforeEach(() => {
    configService = createMock<ConfigService>();
    configService.getOrThrow.mockReturnValue('expected-secret-key');
    guard = new ServiceAuthGuard(configService);
  });

  const contextWithHeader = (header: string | undefined): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ header: () => header }),
      }),
    }) as unknown as ExecutionContext;

  it('allows the request when the provided key matches the configured one', () => {
    expect(guard.canActivate(contextWithHeader('expected-secret-key'))).toBe(
      true,
    );
  });

  it('throws UnauthorizedException when the provided key is wrong', () => {
    expect(() => guard.canActivate(contextWithHeader('wrong-key'))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when no key header is provided', () => {
    expect(() => guard.canActivate(contextWithHeader(undefined))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when the provided key has a different length (timing-safe)', () => {
    expect(() => guard.canActivate(contextWithHeader('short'))).toThrow(
      UnauthorizedException,
    );
  });
});
