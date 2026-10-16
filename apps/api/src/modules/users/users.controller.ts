import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Search users (for chat / pickers)' })
  async search(
    @CurrentUser('id') userId: string,
    @Query('search') search?: string,
  ) {
    const users = await this.users.search(search, userId);
    return users.map((u) => this.users.toChatUser(u));
  }
}
