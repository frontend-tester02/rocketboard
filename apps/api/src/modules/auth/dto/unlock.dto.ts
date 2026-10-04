import { ApiProperty } from '@nestjs/swagger';
import type { UnlockInput } from '@rocket/shared';

export class UnlockDto implements UnlockInput {
  @ApiProperty({ example: 'password123', format: 'password' })
  password!: string;
}
