import { Test, TestingModule } from '@nestjs/testing';
import { BamlController } from './baml.controller';
import { BamlService } from './baml.service';

describe('BamlController', () => {
  let controller: BamlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BamlController],
      providers: [BamlService],
    }).compile();

    controller = module.get<BamlController>(BamlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
