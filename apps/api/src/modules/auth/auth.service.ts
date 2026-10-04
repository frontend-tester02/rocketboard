import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { LoginInput, PublicUser, RegisterInput } from '@rocket/shared';
import * as argon2 from 'argon2';
import type { CookieOptions, Response } from 'express';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';
import type { AuthTokens, JwtPayload } from './types';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const REFRESH_PATH = '/api/v1/auth';

function parseDurationMs(input: string): number {
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) return 0;
  const value = Number(match[1]);
  const mult: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (mult[match[2] as string] ?? 0);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email is already in use');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    return this.issueSession(user);
  }

  async login(dto: LoginInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await this.users.findByEmail(dto.email, true);
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueSession(user);
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await this.users.findById(userId, true);
    if (
      !user?.refreshTokenHash ||
      !(await argon2.verify(user.refreshTokenHash, refreshToken))
    ) {
      throw new UnauthorizedException('Access denied');
    }
    return this.issueSession(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.users.toPublic(user);
  }

  private async issueSession(user: UserDocument) {
    const tokens = await this.issueTokens(user);
    const refreshHash = await argon2.hash(tokens.refreshToken);
    await this.users.setRefreshTokenHash(user.id as string, refreshHash);
    return { user: this.users.toPublic(user), tokens };
  }

  private async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id as string,
      email: user.email,
      role: user.role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  setAuthCookies(res: Response, tokens: AuthTokens): void {
    const base: CookieOptions = {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
    };
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...base,
      path: '/',
      maxAge: parseDurationMs(this.config.get<string>('JWT_ACCESS_TTL', '15m')),
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...base,
      path: REFRESH_PATH,
      maxAge: parseDurationMs(this.config.get<string>('JWT_REFRESH_TTL', '7d')),
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_PATH });
  }
}
