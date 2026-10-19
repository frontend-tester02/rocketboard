import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsModule } from '../uploads/uploads.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity, FileSchema } from './schemas/file.schema';
import { Folder, FolderSchema } from './schemas/folder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
      { name: FileEntity.name, schema: FileSchema },
    ]),
    UploadsModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
