import type { CreateNoteInput, NoteDto, UpdateNote } from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export interface NotesQuery {
  search?: string;
  tag?: string;
}

function cleanParams(q: NotesQuery): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    params[k] = String(v);
  }
  return params;
}

export async function listNotes(query: NotesQuery): Promise<NoteDto[]> {
  const { data } = await apiClient.get<Envelope<NoteDto[]>>('/notes', { params: cleanParams(query) });
  return data.data;
}

export async function listNoteTags(): Promise<string[]> {
  const { data } = await apiClient.get<Envelope<string[]>>('/notes/tags');
  return data.data;
}

export async function getNote(id: string): Promise<NoteDto> {
  const { data } = await apiClient.get<Envelope<NoteDto>>(`/notes/${id}`);
  return data.data;
}

export async function createNote(input: CreateNoteInput): Promise<NoteDto> {
  const { data } = await apiClient.post<Envelope<NoteDto>>('/notes', input);
  return data.data;
}

export async function updateNote(id: string, input: UpdateNote): Promise<NoteDto> {
  const { data } = await apiClient.patch<Envelope<NoteDto>>(`/notes/${id}`, input);
  return data.data;
}

export async function deleteNote(id: string): Promise<void> {
  await apiClient.delete(`/notes/${id}`);
}
