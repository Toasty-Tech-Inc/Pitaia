import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import * as express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        logger: ['error', 'warn', 'log'],
      }
    );
    
    app.enableCors();
    app.setGlobalPrefix('api');
    
    await app.init();
  }
  
  return server;
}

export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};