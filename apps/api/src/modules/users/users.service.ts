import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PublicUser, UserRole } from '@rocket/shared';
import { Model } from 'mongoose';
import { User, type UserDocument } from './schemas/user.schema';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Find by email. Pass `withSecrets` to include passwordHash + refreshTokenHash. */
  findByEmail(email: string, withSecrets = false) {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (withSecrets) query.select('+passwordHash +refreshTokenHash');
    return query.exec();
  }

  findById(id: string, withSecrets = false) {
    const query = this.userModel.findById(id);
    if (withSecrets) query.select('+passwordHash +refreshTokenHash');
    return query.exec();
  }

  create(data: CreateUserData) {
    return this.userModel.create(data);
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.userModel
      .updateOne({ _id: id }, { $set: { refreshTokenHash: hash } })
      .exec();
  }

  async setLocked(id: string, isLocked: boolean): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { $set: { isLocked } }).exec();
  }

  async setResetToken(
    id: string,
    hash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: id },
        { $set: { resetTokenHash: hash, resetTokenExpiresAt: expiresAt } },
      )
      .exec();
  }

  /** Find a user by a valid (non-expired) reset-token hash. */
  findByResetTokenHash(hash: string) {
    return this.userModel
      .findOne({ resetTokenHash: hash, resetTokenExpiresAt: { $gt: new Date() } })
      .exec();
  }

  /** Set a new password and invalidate reset token + all refresh sessions. */
  async resetPassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: id },
        {
          $set: { passwordHash },
          $unset: {
            resetTokenHash: '',
            resetTokenExpiresAt: '',
            refreshTokenHash: '',
          },
        },
      )
      .exec();
  }

  /** Map a user document to the safe, public shape returned by the api. */
  toPublic(user: UserDocument): PublicUser {
    return {
      id: user.id as string,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      jobTitle: user.jobTitle,
      phone: user.phone,
      location: user.location,
      isLocked: user.isLocked,
    };
  }
}
