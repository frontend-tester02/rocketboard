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
  createNoteSchema,
  noteListQuerySchema,
  updateNoteSchema,
  type CreateNote,
  type NoteListQuery,
  type UpdateNote,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { NotesService } from './notes.service';

@ApiTags('Notes')
@ApiCookieAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List notes (filter by tag / search)' })
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(noteListQuerySchema)) query: NoteListQuery,
  ) {
    return this.notes.list(userId, query);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Distinct tags across the user notes' })
  tags(@CurrentUser('id') userId: string) {
    return this.notes.tags(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note' })
  getOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.notes.getById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a note' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createNoteSchema)) dto: CreateNote,
  ) {
    return this.notes.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateNoteSchema)) dto: UpdateNote,
  ) {
    return this.notes.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a note' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.notes.remove(userId, id);
  }
}
