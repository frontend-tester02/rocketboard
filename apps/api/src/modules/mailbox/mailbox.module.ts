import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { MailboxController } from './mailbox.controller';
import { MailboxService } from './mailbox.service';
import { MailLabel, MailLabelSchema } from './schemas/mail-label.schema';
import { Mail, MailSchema } from './schemas/mail.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mail.name, schema: MailSchema },
      { name: MailLabel.name, schema: MailLabelSchema },
    ]),
    UsersModule,
  ],
  controllers: [MailboxController],
  providers: [MailboxService],
  exports: [MailboxService],
})
export class MailboxModule {}
