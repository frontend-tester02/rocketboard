import { ApiProperty } from '@nestjs/swagger';
import type { RegisterInput } from '@rocket/shared';

export class RegisterDto implements RegisterInput {
  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Cooper' })
  lastName!: string;

  @ApiProperty({ example: 'jane@rocket.dev' })
  email!: string;

  @ApiProperty({ example: 'password123', format: 'password', minLength: 8 })
  password!: string;
}
