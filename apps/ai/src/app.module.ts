import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BamlModule } from './baml/baml.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BamlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
