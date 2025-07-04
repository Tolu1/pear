import { Injectable } from '@nestjs/common';
import { PaymentAdapter } from './interfaces/payment-adapter.interface';
import { JumiaAdapter } from './adapters/jumia.adapter';

@Injectable()
export class AdaptersService {
  private readonly adapters: PaymentAdapter[] = [new JumiaAdapter()];

  getAdapter(domain: string): PaymentAdapter | null {
    return this.adapters.find((adapter) => adapter.supports(domain)) || null;
  }
}
