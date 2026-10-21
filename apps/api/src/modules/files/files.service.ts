import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  storageKindOf,
  type Breadcrumb,
  type CreateFolder,
  type FileDto,
  type FileListQuery,
  type FolderContents,
  type FolderDto,
  type StorageKind,
  type StorageUsage,
  type UpdateFile,
  type UpdateFolder,
} from '@rocket/shared';
import { Model, Types } from 'mongoose';
import { UploadsService, type UploadedImage } from '../uploads/uploads.service';
import { FileEntity } from './schemas/file.schema';
import { Folder } from './schemas/folder.schema';

/** Total storage quota per user, for the storage widget (10 GB). */
const STORAGE_QUOTA = 10 * 1024 * 1024 * 1024;

@Injectable()
export class FilesService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(FileEntity.name) private readonly fileModel: Model<FileEntity>,
    private readonly uploads: UploadsService,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl() {
    return this.config.get<string>('APP_URL', 'http://localhost:4000');
  }

  private toFolderDto(f: Folder & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date }, fileCount = 0): FolderDto {
    return {
      id: String(f._id),
      owner: String(f.owner),
      name: f.name,
      parent: f.parent ? String(f.parent) : null,
      color: f.color,
      fileCount,
      createdAt: f.createdAt?.toISOString(),
      updatedAt: f.updatedAt?.toISOString(),
    };
  }

  private toFileDto(f: FileEntity & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date }): FileDto {
    return {
      id: String(f._id),
      owner: String(f.owner),
      name: f.name,
      folder: f.folder ? String(f.folder) : null,
      size: f.size,
      mimeType: f.mimeType,
      storageKey: f.storageKey,
      url: `${this.baseUrl}/uploads/${f.storageKey}`,
      sharedWith: f.sharedWith.map((s) => String(s)),
      isStarred: f.isStarred,
      createdAt: f.createdAt?.toISOString(),
      updatedAt: f.updatedAt?.toISOString(),
    };
  }

  async list(userId: string, query: FileListQuery): Promise<FolderContents> {
    const owner = new Types.ObjectId(userId);

    if (query.starred) {
      const files = await this.fileModel
        .find({ owner, isStarred: true })
        .sort({ updatedAt: -1 })
        .exec();
      return { folders: [], files: files.map((f) => this.toFileDto(f)), breadcrumbs: [] };
    }

    const parent = query.folderId ? new Types.ObjectId(query.folderId) : null;
    const [folders, files] = await Promise.all([
      this.folderModel.find({ owner, parent }).sort({ name: 1 }).exec(),
      this.fileModel.find({ owner, folder: parent }).sort({ createdAt: -1 }).exec(),
    ]);

    // File counts per folder (direct children only).
    const counts = await this.fileModel.aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: { owner, folder: { $in: folders.map((f) => f._id) } } },
      { $group: { _id: '$folder', n: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

    return {
      folders: folders.map((f) => this.toFolderDto(f, countMap.get(String(f._id)) ?? 0)),
      files: files.map((f) => this.toFileDto(f)),
      breadcrumbs: query.folderId ? await this.breadcrumbs(owner, query.folderId) : [],
    };
  }

  private async breadcrumbs(owner: Types.ObjectId, folderId: string): Promise<Breadcrumb[]> {
    const trail: Breadcrumb[] = [];
    let current: Types.ObjectId | null = new Types.ObjectId(folderId);
    const guard = new Set<string>();
    while (current && !guard.has(String(current))) {
      guard.add(String(current));
      const folder: (Folder & { _id: Types.ObjectId }) | null = await this.folderModel
        .findOne({ _id: current, owner })
        .exec();
      if (!folder) break;
      trail.unshift({ id: String(folder._id), name: folder.name });
      current = folder.parent;
    }
    return trail;
  }

  async createFolder(userId: string, dto: CreateFolder): Promise<FolderDto> {
    const folder = await this.folderModel.create({
      owner: new Types.ObjectId(userId),
      name: dto.name,
      parent: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
      color: dto.color,
    });
    return this.toFolderDto(folder);
  }

  async updateFolder(userId: string, id: string, dto: UpdateFolder): Promise<FolderDto> {
    const owner = new Types.ObjectId(userId);
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.color !== undefined) patch.color = dto.color;
    if (dto.parentId !== undefined) {
      patch.parent = dto.parentId ? new Types.ObjectId(dto.parentId) : null;
    }
    const folder = await this.folderModel
      .findOneAndUpdate({ _id: id, owner }, patch, { new: true })
      .exec();
    if (!folder) throw new NotFoundException('Folder not found');
    return this.toFolderDto(folder);
  }

  async removeFolder(userId: string, id: string): Promise<void> {
    const owner = new Types.ObjectId(userId);
    const root = await this.folderModel.findOne({ _id: id, owner }).exec();
    if (!root) throw new NotFoundException('Folder not found');

    // Collect the folder subtree (breadth-first).
    const ids = [root._id];
    const queue = [root._id];
    while (queue.length) {
      const parent = queue.shift()!;
      const children = await this.folderModel.find({ owner, parent }).select('_id').exec();
      for (const c of children) {
        ids.push(c._id);
        queue.push(c._id);
      }
    }

    // Remove the files on disk, then the documents.
    const files = await this.fileModel.find({ owner, folder: { $in: ids } }).exec();
    await Promise.all(files.map((f) => this.unlink(f.storageKey)));
    await this.fileModel.deleteMany({ owner, folder: { $in: ids } }).exec();
    await this.folderModel.deleteMany({ owner, _id: { $in: ids } }).exec();
  }

  async upload(userId: string, folderId: string | undefined, files: UploadedImage[]): Promise<FileDto[]> {
    const owner = new Types.ObjectId(userId);
    const folder = folderId ? new Types.ObjectId(folderId) : null;
    const created = await Promise.all(
      files.map(async (file) => {
        const { key } = this.uploads.save(file);
        return this.fileModel.create({
          owner,
          name: file.originalname,
          folder,
          size: file.size,
          mimeType: file.mimetype,
          storageKey: key,
        });
      }),
    );
    return created.map((f) => this.toFileDto(f));
  }

  async updateFile(userId: string, id: string, dto: UpdateFile): Promise<FileDto> {
    const owner = new Types.ObjectId(userId);
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.isStarred !== undefined) patch.isStarred = dto.isStarred;
    if (dto.folderId !== undefined) {
      patch.folder = dto.folderId ? new Types.ObjectId(dto.folderId) : null;
    }
    const file = await this.fileModel
      .findOneAndUpdate({ _id: id, owner }, patch, { new: true })
      .exec();
    if (!file) throw new NotFoundException('File not found');
    return this.toFileDto(file);
  }

  async removeFile(userId: string, id: string): Promise<void> {
    const owner = new Types.ObjectId(userId);
    const file = await this.fileModel.findOneAndDelete({ _id: id, owner }).exec();
    if (!file) throw new NotFoundException('File not found');
    await this.unlink(file.storageKey);
  }

  async getFile(userId: string, id: string): Promise<FileDto> {
    const owner = new Types.ObjectId(userId);
    const file = await this.fileModel.findOne({ _id: id, owner }).exec();
    if (!file) throw new NotFoundException('File not found');
    return this.toFileDto(file);
  }

  async download(userId: string, id: string): Promise<{ url: string; name: string }> {
    const owner = new Types.ObjectId(userId);
    const file = await this.fileModel.findOne({ _id: id, owner }).exec();
    if (!file) throw new NotFoundException('File not found');
    return { url: `${this.baseUrl}/uploads/${file.storageKey}`, name: file.name };
  }

  async storage(userId: string): Promise<StorageUsage> {
    const owner = new Types.ObjectId(userId);
    const files = await this.fileModel.find({ owner }).select('size mimeType').exec();
    const byKind = {
      images: { size: 0, count: 0 },
      documents: { size: 0, count: 0 },
      videos: { size: 0, count: 0 },
      audio: { size: 0, count: 0 },
      other: { size: 0, count: 0 },
    } as Record<StorageKind, { size: number; count: number }>;
    let used = 0;
    for (const f of files) {
      const kind = storageKindOf(f.mimeType);
      byKind[kind].size += f.size;
      byKind[kind].count += 1;
      used += f.size;
    }
    return { used, total: STORAGE_QUOTA, byKind };
  }

  private async unlink(storageKey: string): Promise<void> {
    await rm(join(this.uploadDir, storageKey), { force: true }).catch(() => undefined);
  }
}
