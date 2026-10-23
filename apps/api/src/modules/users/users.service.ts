import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ChatUser, PublicUser, UpdateProfile, UserRole } from '@rocket/shared';
import * as argon2 from 'argon2';
import { FilterQuery, Model } from 'mongoose';
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

  /** Search users by name/email, excluding one id (for chat/contact pickers). */
  search(term: string | undefined, excludeId: string, limit = 20) {
    const filter: FilterQuery<UserDocument> = {
      _id: { $ne: excludeId },
    };
    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(escaped, 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
    }
    return this.userModel.find(filter).sort({ firstName: 1 }).limit(limit).exec();
  }

  /** Map a user document to the compact shape used by chat. */
  toChatUser(user: UserDocument): ChatUser {
    return {
      id: user.id as string,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    };
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

  /** Current user's full profile (for GET /users/me). */
  async getMe(id: string): Promise<PublicUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  /** Public profile of any user (for GET /users/:id). */
  async getPublic(id: string): Promise<PublicUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async updateProfile(id: string, dto: UpdateProfile): Promise<PublicUser> {
    const user = await this.userModel.findByIdAndUpdate(id, { ...dto }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async setAvatar(id: string, avatar: string): Promise<PublicUser> {
    const user = await this.userModel.findByIdAndUpdate(id, { avatar }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  /** Change password after verifying the current one. Invalidates refresh sessions. */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id, true);
    if (!user) throw new NotFoundException('User not found');
    const ok = await argon2.verify(user.passwordHash, currentPassword);
    if (!ok) throw new BadRequestException('Current password is incorrect');
    const passwordHash = await argon2.hash(newPassword);
    await this.userModel
      .updateOne({ _id: id }, { $set: { passwordHash }, $unset: { refreshTokenHash: '' } })
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
      birthday: user.birthday ? user.birthday.toISOString() : undefined,
      isLocked: user.isLocked,
    };
  }
}
