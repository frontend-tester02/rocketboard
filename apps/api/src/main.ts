import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global API prefix, CORS, cookies, helmet, Swagger — configured in S3.
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Rocket API: http://localhost:${port}/api/v1/health`);
}

void bootstrap();
