import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Validates that a route/query param is a well-formed Mongo ObjectId and
 * returns it as a string (ready to use in Mongoose queries). Throws
 * `BadRequestException` otherwise.
 *
 *   `@Param('id', ParseObjectIdPipe) id: string`
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid id: "${value}"`);
    }
    return value;
  }
}
