import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CoinGeckoService } from './coingecko.service';
import { FiatToCryptoService } from './fiat-to-crypto.service';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [CacheModule.register({ ttl: 30_000, max: 100 }), TokensModule],
  providers: [CoinGeckoService, FiatToCryptoService],
  exports: [FiatToCryptoService],
})
export class RatesModule {}
