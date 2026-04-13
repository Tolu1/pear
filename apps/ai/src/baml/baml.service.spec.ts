import { Test, TestingModule } from '@nestjs/testing';
import { BamlService } from './baml.service';

describe('BamlService', () => {
  let service: BamlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BamlService],
    }).compile();

    service = module.get<BamlService>(BamlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
