import { Controller } from '@nestjs/common';
import { BamlService } from './baml.service';

@Controller('baml')
export class BamlController {
  constructor(private readonly bamlService: BamlService) {}
}
