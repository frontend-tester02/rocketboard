import { ApiProperty } from '@nestjs/swagger';
import type { ResetPasswordInput } from '@rocket/shared';

export class ResetPasswordDto implements ResetPasswordInput {
  @ApiProperty({ description: 'Reset token from the emailed link' })
  token!: string;

  @ApiProperty({ example: 'newPassword123', format: 'password', minLength: 8 })
  password!: string;
}
