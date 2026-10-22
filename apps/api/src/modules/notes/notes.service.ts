import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CreateNote, NoteListQuery, UpdateNote } from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Note } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private readonly noteModel: Model<Note>) {}

  async list(userId: string, query: NoteListQuery) {
    const owner = new Types.ObjectId(userId);
    const filter: FilterQuery<Note> = { owner };
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { content: rx }];
    }
    // Pinned first, then most recently updated.
    const notes = await this.noteModel.find(filter).sort({ isPinned: -1, updatedAt: -1 }).exec();
    return notes.map((n) => n.toJSON());
  }

  /** Distinct tags across the user's notes (for the tag filter bar). */
  async tags(userId: string): Promise<string[]> {
    const owner = new Types.ObjectId(userId);
    const tags = (await this.noteModel.distinct('tags', { owner }).exec()) as string[];
    return tags.sort((a, b) => a.localeCompare(b));
  }

  async getById(userId: string, id: string) {
    const note = await this.ensureNote(userId, id);
    return note.toJSON();
  }

  async create(userId: string, dto: CreateNote) {
    const note = await this.noteModel.create({
      owner: new Types.ObjectId(userId),
      title: dto.title ?? '',
      content: dto.content ?? '',
      color: dto.color,
      tags: dto.tags ?? [],
      isPinned: dto.isPinned ?? false,
    });
    return note.toJSON();
  }

  async update(userId: string, id: string, dto: UpdateNote) {
    await this.ensureNote(userId, id);
    const note = await this.noteModel.findByIdAndUpdate(id, { ...dto }, { new: true }).exec();
    if (!note) throw new NotFoundException('Note not found');
    return note.toJSON();
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.ensureNote(userId, id);
    await this.noteModel.deleteOne({ _id: id }).exec();
  }

  private async ensureNote(userId: string, id: string) {
    const note = await this.noteModel.findById(id).exec();
    if (!note) throw new NotFoundException('Note not found');
    if (String(note.owner) !== userId) throw new ForbiddenException('Not your note');
    return note;
  }
}
