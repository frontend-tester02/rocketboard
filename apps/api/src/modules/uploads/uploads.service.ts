import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Minimal shape of the in-memory uploaded file (multer memory storage). */
export interface UploadedImage {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Storage for uploaded images.
 *
 * Dev driver: local disk under `apps/api/uploads`, served statically at
 * `/uploads/<key>` (see `main.ts`). The production target is MinIO/S3
 * (S3_* env vars) — swap the body of `save()` for an S3 PutObject to switch.
 */
@Injectable()
export class UploadsService {
  private readonly dir = join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService) {
    mkdirSync(this.dir, { recursive: true });
  }

  save(file: UploadedImage): UploadResult {
    const ext = extname(file.originalname) || '.png';
    const key = `${randomUUID()}${ext}`;
    writeFileSync(join(this.dir, key), file.buffer);
    const base = this.config.get<string>('APP_URL', 'http://localhost:4000');
    return { url: `${base}/uploads/${key}`, key };
  }
}
