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
  contactListQuerySchema,
  createContactSchema,
  updateContactSchema,
  type ContactListQuery,
  type CreateContact,
  type UpdateContact,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { ContactsService } from './contacts.service';

@ApiTags('Contacts')
@ApiCookieAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List contacts (filter by favorite / search, A–Z)' })
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(contactListQuerySchema)) query: ContactListQuery,
  ) {
    return this.contacts.list(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact' })
  getOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.contacts.getById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a contact' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createContactSchema)) dto: CreateContact,
  ) {
    return this.contacts.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact (rename / favorite / …)' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateContactSchema)) dto: UpdateContact,
  ) {
    return this.contacts.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a contact' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.contacts.remove(userId, id);
  }
}
