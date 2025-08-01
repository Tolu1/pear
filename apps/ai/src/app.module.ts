import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BamlModule } from './baml/baml.module';

@Module({
  imports: [BamlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
