import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  // Serve uploaded images (dev disk storage) outside the /api/v1 prefix.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.use(
    helmet({
      // Allow cross-origin <img> loading of uploaded files from the web app.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('WEB_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // Validation is Zod-based (per-route ZodValidationPipe); no global pipe.

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rocket API')
    .setDescription('Rocket admin panel API')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Rocket API: http://localhost:${port}/api/v1/health`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger:    http://localhost:${port}/api/docs`);
}

void bootstrap();
