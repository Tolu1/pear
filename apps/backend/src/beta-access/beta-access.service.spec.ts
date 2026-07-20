import { Test } from '@nestjs/testing';
import { BetaAccessService } from './beta-access.service';
import { MAX_RUNS } from './beta-access.constants';
import { BetaAccessRepository } from './beta-access.repository';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeBetaAccess } from '../../test/factories';

describe('BetaAccessService', () => {
  let service: BetaAccessService;
  let repo: DeepMocked<BetaAccessRepository>;

  beforeEach(async () => {
    repo = createMock<BetaAccessRepository>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        BetaAccessService,
        { provide: BetaAccessRepository, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(BetaAccessService);
  });

  describe('validate()', () => {
    it('returns remaining and limit for an active code', async () => {
      repo.findByCode.mockResolvedValue(
        makeBetaAccess({ runsGranted: 25, runsUsed: 7 }),
      );

      expect(await service.validate('PEAR-TEST')).toEqual({
        valid: true,
        remaining: 18,
        limit: MAX_RUNS,
      });
    });

    it('normalizes the code before looking it up', async () => {
      repo.findByCode.mockResolvedValue(makeBetaAccess());

      await service.validate('  pear-test  ');

      expect(repo.findByCode).toHaveBeenCalledWith('PEAR-TEST');
    });

    it('rejects an unknown code', async () => {
      repo.findByCode.mockResolvedValue(undefined);

      expect(await service.validate('NOPE')).toEqual({
        valid: false,
        remaining: 0,
        limit: MAX_RUNS,
      });
    });

    it('rejects a revoked code', async () => {
      repo.findByCode.mockResolvedValue(makeBetaAccess({ active: false }));

      expect(await service.validate('PEAR-TEST')).toEqual({
        valid: false,
        remaining: 0,
        limit: MAX_RUNS,
      });
    });
  });

  describe('consume()', () => {
    it('returns ok with the post-consume remaining', async () => {
      repo.consumeOne.mockResolvedValue(
        makeBetaAccess({ runsGranted: 25, runsUsed: 8 }),
      );

      expect(await service.consume('PEAR-TEST')).toEqual({
        ok: true,
        remaining: 17,
        limit: MAX_RUNS,
      });
    });

    it('normalizes the code before consuming', async () => {
      repo.consumeOne.mockResolvedValue(makeBetaAccess());

      await service.consume(' pear-test ');

      expect(repo.consumeOne).toHaveBeenCalledWith('PEAR-TEST');
    });

    it('refuses when no row was consumed (exhausted, revoked, or unknown)', async () => {
      repo.consumeOne.mockResolvedValue(undefined);

      expect(await service.consume('PEAR-TEST')).toEqual({
        ok: false,
        remaining: 0,
        limit: MAX_RUNS,
      });
    });
  });
});
