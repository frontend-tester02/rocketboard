import { ApiProperty } from '@nestjs/swagger';
import type { ForgotPasswordInput } from '@rocket/shared';

export class ForgotPasswordDto implements ForgotPasswordInput {
  @ApiProperty({ example: 'jane@rocket.dev' })
  email!: string;
}
