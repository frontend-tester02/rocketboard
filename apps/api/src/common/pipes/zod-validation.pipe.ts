import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Validates and parses an argument against a Zod schema. Construct per-use:
 *
 *   `@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery`
 *   `@Body(new ZodValidationPipe(createProductSchema)) dto: CreateProduct`
 *
 * On failure throws a `BadRequestException` whose body carries field-level
 * `details` (consumed by `AllExceptionsFilter`).
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: this.formatDetails(result.error),
      });
    }
    return result.data;
  }

  private formatDetails(error: ZodError): Record<string, string[]> {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_';
      (details[key] ??= []).push(issue.message);
    }
    return details;
  }
}
