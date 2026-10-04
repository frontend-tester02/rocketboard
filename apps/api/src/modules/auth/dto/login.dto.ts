import { ApiProperty } from '@nestjs/swagger';
import type { LoginInput } from '@rocket/shared';

export class LoginDto implements LoginInput {
  @ApiProperty({ example: 'jane@rocket.dev' })
  email!: string;

  @ApiProperty({ example: 'password123', format: 'password' })
  password!: string;

  @ApiProperty({ required: false, default: false })
  rememberMe!: boolean;
}
