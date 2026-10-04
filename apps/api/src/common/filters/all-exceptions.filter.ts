import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError } from '@rocket/shared';
import type { Request, Response } from 'express';

/**
 * Catch-all filter that renders every thrown error as the shared `ApiError`
 * envelope. Handles Nest `HttpException`s (including validation message
 * arrays and `details`), Mongo duplicate-key (E11000 → 409), Mongoose
 * validation errors (→ 400), and otherwise falls back to a 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let details: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (resp && typeof resp === 'object') {
        const r = resp as Record<string, unknown>;
        message = (r.message as string | string[]) ?? exception.message;
        error = (r.error as string) ?? error;
        details = r.details as Record<string, string[]> | undefined;
      }
    } else if (this.isDuplicateKeyError(exception)) {
      status = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = 'A record with these values already exists';
    } else if (this.isMongooseValidationError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      message = (exception as { message: string }).message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiError = {
      statusCode: status,
      message,
      error,
      path: req.url,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    };

    res.status(status).json(body);
  }

  private isDuplicateKeyError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as { code?: number }).code === 11000
    );
  }

  private isMongooseValidationError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as { name?: string }).name === 'ValidationError'
    );
  }
}
