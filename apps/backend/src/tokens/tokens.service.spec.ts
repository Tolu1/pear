import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: TokensRepository,
          useValue: { findAll: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
