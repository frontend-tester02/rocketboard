import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  composeMailSchema,
  createMailLabelSchema,
  draftMailSchema,
  mailListQuerySchema,
  patchMailSchema,
  updateMailLabelSchema,
  type ComposeMail,
  type CreateMailLabel,
  type DraftMail,
  type MailListQuery,
  type PatchMail,
  type UpdateMailLabel,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { MailboxService } from './mailbox.service';

@ApiTags('Mail')
@ApiCookieAuth()
@Controller()
export class MailboxController {
  constructor(private readonly mailbox: MailboxService) {}

  // ── Mails ──────────────────────────────────────────────────────────────

  @Get('mails')
  @ApiOperation({ summary: 'List mails in a folder' })
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(mailListQuerySchema)) query: MailListQuery,
  ) {
    return this.mailbox.list(userId, query);
  }

  @Get('mails/counts')
  @ApiOperation({ summary: 'Per-folder counts + unread' })
  counts(@CurrentUser('id') userId: string) {
    return this.mailbox.counts(userId);
  }

  @Get('mails/:id')
  @ApiOperation({ summary: 'Get a mail (marks it read)' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.mailbox.findById(userId, id);
  }

  @Post('mails')
  @ApiOperation({ summary: 'Send a mail' })
  send(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(composeMailSchema)) dto: ComposeMail,
  ) {
    return this.mailbox.send(userId, dto);
  }

  @Post('mails/draft')
  @ApiOperation({ summary: 'Save a draft' })
  draft(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(draftMailSchema)) dto: DraftMail,
  ) {
    return this.mailbox.saveDraft(userId, dto);
  }

  @Patch('mails/:id')
  @ApiOperation({ summary: 'Update a mail (star / read / labels / move)' })
  patch(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(patchMailSchema)) dto: PatchMail,
  ) {
    return this.mailbox.patch(userId, id, dto);
  }

  @Delete('mails/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Trash a mail (or delete if already trashed)' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.mailbox.remove(userId, id);
  }

  // ── Labels ─────────────────────────────────────────────────────────────

  @Get('mail-labels')
  @ApiOperation({ summary: 'List my mail labels' })
  listLabels(@CurrentUser('id') userId: string) {
    return this.mailbox.listLabels(userId);
  }

  @Post('mail-labels')
  @ApiOperation({ summary: 'Create a mail label' })
  createLabel(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createMailLabelSchema)) dto: CreateMailLabel,
  ) {
    return this.mailbox.createLabel(userId, dto);
  }

  @Patch('mail-labels/:id')
  @ApiOperation({ summary: 'Update a mail label' })
  updateLabel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateMailLabelSchema)) dto: UpdateMailLabel,
  ) {
    return this.mailbox.updateLabel(userId, id, dto);
  }

  @Delete('mail-labels/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a mail label' })
  async removeLabel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.mailbox.removeLabel(userId, id);
  }
}
