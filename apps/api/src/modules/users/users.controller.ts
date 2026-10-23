import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfile,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { UploadsService, type UploadedImage } from '../uploads/uploads.service';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly uploads: UploadsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search users (for chat / pickers)' })
  async search(
    @CurrentUser('id') userId: string,
    @Query('search') search?: string,
  ) {
    const users = await this.users.search(search, userId);
    return users.map((u) => this.users.toChatUser(u));
  }

  @Get('me')
  @ApiOperation({ summary: 'Current user profile' })
  me(@CurrentUser('id') userId: string) {
    return this.users.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfile,
  ) {
    return this.users.updateProfile(userId, dto);
  }

  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload current user avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: UploadedImage,
  ) {
    const { url } = this.uploads.save(file);
    return this.users.setAvatar(userId, url);
  }

  @Patch('me/password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordInput,
  ): Promise<void> {
    await this.users.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public profile of a user' })
  getOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.users.getPublic(id);
  }
}
