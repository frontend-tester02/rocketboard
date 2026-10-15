import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadsService, type UploadedImage } from './uploads.service';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@ApiTags('Uploads')
@ApiCookieAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image (returns { url, key })' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpe?g|webp|gif)$/ }),
        ],
      }),
    )
    file: UploadedImage,
  ) {
    return this.uploads.save(file);
  }
}
