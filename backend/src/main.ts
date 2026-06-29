// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors({
  //   origin: process.env.FRONTEND_URL,
  //   credentials: true,
  // });

  // For local development
  // app.enableCors({
  //   origin: ['http://localhost:3004', 'https://fifa.kriskilsby.com'],
  // });

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3004',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
