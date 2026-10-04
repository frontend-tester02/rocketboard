// Shared error envelope returned by the api's AllExceptionsFilter (S3) and
// consumed by the web api-client interceptor (S4).
import { z } from 'zod';

export const apiErrorSchema = z.object({
  /** HTTP status code. */
  statusCode: z.number().int(),
  /** Human-readable message, or an array of validation messages. */
  message: z.union([z.string(), z.array(z.string())]),
  /** Short error name, e.g. "Bad Request". */
  error: z.string().optional(),
  /** Request path that produced the error. */
  path: z.string().optional(),
  /** ISO timestamp of when the error occurred. */
  timestamp: z.string().optional(),
  /** Optional field-level validation details. */
  details: z.record(z.string(), z.array(z.string())).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
