import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppController } from './app.controller';
import {
  AllExceptionsFilter,
  ResponseTransformInterceptor,
  baseSchemaPlugin,
} from './common';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
        // Register the base plugin globally so every schema gets timestamps
        // and the `_id` → `id` serialization transform.
        connectionFactory: (connection: Connection) => {
          connection.plugin(baseSchemaPlugin);
          return connection;
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
