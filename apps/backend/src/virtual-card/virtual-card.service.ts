import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type VirtualCard } from './interfaces/virtual-card.interface';

@Injectable()
export class VirtualCardService {
  constructor(private readonly configService: ConfigService) {}

  issueCard(): VirtualCard {
    // TODO: replace with external card-issuing API call
    return {
      number: this.configService.getOrThrow<string>('CARD_NUMBER'),
      expiry: this.configService.getOrThrow<string>('CARD_EXPIRY'),
      cvv: this.configService.getOrThrow<string>('CARD_CVV'),
      name: this.configService.getOrThrow<string>('CARD_NAME'),
    };
  }
}
