import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  createFolderSchema,
  fileListQuerySchema,
  updateFileSchema,
  updateFolderSchema,
  type CreateFolder,
  type FileListQuery,
  type UpdateFile,
  type UpdateFolder,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { FilesService } from './files.service';
import type { UploadedImage } from '../uploads/uploads.service';

@ApiTags('Files')
@ApiCookieAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List folders + files in a folder (with breadcrumbs)' })
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(fileListQuerySchema)) query: FileListQuery,
  ) {
    return this.files.list(userId, query);
  }

  @Get('storage')
  @ApiOperation({ summary: 'Storage usage by kind' })
  storage(@CurrentUser('id') userId: string) {
    return this.files.storage(userId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create a folder' })
  createFolder(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createFolderSchema)) dto: CreateFolder,
  ) {
    return this.files.createFolder(userId, dto);
  }

  @Patch('folders/:id')
  @ApiOperation({ summary: 'Rename / move / recolor a folder' })
  updateFolder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateFolderSchema)) dto: UpdateFolder,
  ) {
    return this.files.updateFolder(userId, id, dto);
  }

  @Delete('folders/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a folder (and its contents)' })
  async removeFolder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.files.removeFolder(userId, id);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload one or more files into a folder' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folderId: { type: 'string' },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20))
  upload(
    @CurrentUser('id') userId: string,
    @Query('folderId') folderId: string | undefined,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true })) files: UploadedImage[],
  ) {
    return this.files.upload(userId, folderId || undefined, files);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename / move / star a file' })
  updateFile(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateFileSchema)) dto: UpdateFile,
  ) {
    return this.files.updateFile(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a file' })
  async removeFile(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.files.removeFile(userId, id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get a download URL for a file' })
  download(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.files.download(userId, id);
  }
}
