import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { loginSchema, registerSchema } from '@rocket/shared';
import type { Response } from 'express';
import { CurrentUser, Public, ZodValidationPipe } from '../../common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { RefreshUser } from './types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user and start a session' })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.register(dto);
    this.auth.setAuthCookies(res, tokens);
    return user;
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.login(dto);
    this.auth.setAuthCookies(res, tokens);
    return user;
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Rotate tokens using the refresh cookie' })
  async refresh(
    @CurrentUser() user: RefreshUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.refresh(user.id, user.refreshToken);
    this.auth.setAuthCookies(res, result.tokens);
    return result.user;
  }

  @HttpCode(200)
  @Post('logout')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Log out and clear the session' })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(userId);
    this.auth.clearAuthCookies(res);
    return { success: true };
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  me(@CurrentUser('id') userId: string) {
    return this.auth.me(userId);
  }
}
