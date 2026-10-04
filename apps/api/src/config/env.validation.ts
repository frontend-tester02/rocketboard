import * as Joi from 'joi';

/**
 * Joi schema validating process env at boot. Passed to
 * `ConfigModule.forRoot({ validationSchema })` — the app fails fast on a
 * missing or malformed variable.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(4000),
  WEB_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database
  MONGO_URI: Joi.string().required(),

  // Auth (JWT)
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),

  // MinIO / S3
  S3_ENDPOINT: Joi.string().uri().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  S3_REGION: Joi.string().default('us-east-1'),

  // Mail (mailpit in dev)
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().port().default(1025),
  SMTP_FROM: Joi.string().default('no-reply@rocket.local'),
});
