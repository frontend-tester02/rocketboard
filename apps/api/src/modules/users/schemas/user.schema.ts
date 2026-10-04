import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from '@rocket/shared';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // Hidden by default; explicitly selected during authentication.
  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop()
  avatar?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.User,
  })
  role!: UserRole;

  @Prop()
  jobTitle?: string;

  @Prop()
  phone?: string;

  @Prop()
  birthday?: Date;

  @Prop()
  location?: string;

  // Argon2 hash of the current refresh token; hidden by default.
  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ default: false })
  isLocked!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
