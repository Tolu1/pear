// apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for extension
  app.enableCors({
    origin: [
      'chrome-extension://*',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Increase payload limit for screenshots
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(
    `🤖 AI Automation endpoints available at http://localhost:${port}/api/automation`,
  );
}

bootstrap();
