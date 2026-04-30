import { Module } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';
import { FiatToCryptoService } from './fiat-to-crypto.service';

@Module({
  providers: [CoinGeckoService, FiatToCryptoService],
  exports: [FiatToCryptoService],
})
export class RatesModule {}
