// src/serverless.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import * as express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const expressApp = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn', 'log'] }
    );

    app.setGlobalPrefix('api');
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  }
  return expressApp;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const server = await bootstrap();
  server(req, res);
};
