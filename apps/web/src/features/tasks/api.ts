import type {
  BoardDto,
  BoardWithTasks,
  CreateBoardInput,
  CreateColumn,
  CreateTaskInput,
  CreateTaskLabel,
  MoveTask,
  TaskCommentDto,
  TaskDto,
  TaskLabelDto,
  UpdateBoard,
  UpdateColumn,
  UpdateTask,
  UpdateTaskLabel,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export async function listBoards(): Promise<BoardDto[]> {
  const { data } = await apiClient.get<Envelope<BoardDto[]>>('/boards');
  return data.data;
}
export async function getBoard(id: string): Promise<BoardWithTasks> {
  const { data } = await apiClient.get<Envelope<BoardWithTasks>>(`/boards/${id}`);
  return data.data;
}
export async function createBoard(input: CreateBoardInput): Promise<BoardDto> {
  const { data } = await apiClient.post<Envelope<BoardDto>>('/boards', input);
  return data.data;
}
export async function updateBoard(id: string, input: UpdateBoard): Promise<BoardDto> {
  const { data } = await apiClient.patch<Envelope<BoardDto>>(`/boards/${id}`, input);
  return data.data;
}
export async function addColumn(boardId: string, input: CreateColumn): Promise<BoardDto> {
  const { data } = await apiClient.post<Envelope<BoardDto>>(`/boards/${boardId}/columns`, input);
  return data.data;
}
export async function updateColumn(boardId: string, columnId: string, input: UpdateColumn): Promise<BoardDto> {
  const { data } = await apiClient.patch<Envelope<BoardDto>>(`/boards/${boardId}/columns/${columnId}`, input);
  return data.data;
}
export async function removeColumn(boardId: string, columnId: string): Promise<BoardDto> {
  const { data } = await apiClient.delete<Envelope<BoardDto>>(`/boards/${boardId}/columns/${columnId}`);
  return data.data;
}

export async function createTask(input: CreateTaskInput): Promise<TaskDto> {
  const { data } = await apiClient.post<Envelope<TaskDto>>('/tasks', input);
  return data.data;
}
export async function getTask(id: string): Promise<TaskDto> {
  const { data } = await apiClient.get<Envelope<TaskDto>>(`/tasks/${id}`);
  return data.data;
}
export async function updateTask(id: string, input: UpdateTask): Promise<TaskDto> {
  const { data } = await apiClient.patch<Envelope<TaskDto>>(`/tasks/${id}`, input);
  return data.data;
}
export async function moveTask(id: string, input: MoveTask): Promise<TaskDto> {
  const { data } = await apiClient.patch<Envelope<TaskDto>>(`/tasks/${id}/move`, input);
  return data.data;
}
export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function listComments(taskId: string): Promise<TaskCommentDto[]> {
  const { data } = await apiClient.get<Envelope<TaskCommentDto[]>>(`/tasks/${taskId}/comments`);
  return data.data;
}
export async function addComment(taskId: string, text: string): Promise<TaskCommentDto> {
  const { data } = await apiClient.post<Envelope<TaskCommentDto>>(`/tasks/${taskId}/comments`, { text });
  return data.data;
}

export async function listTaskLabels(): Promise<TaskLabelDto[]> {
  const { data } = await apiClient.get<Envelope<TaskLabelDto[]>>('/task-labels');
  return data.data;
}
export async function createTaskLabel(input: CreateTaskLabel): Promise<TaskLabelDto> {
  const { data } = await apiClient.post<Envelope<TaskLabelDto>>('/task-labels', input);
  return data.data;
}
export async function updateTaskLabel(id: string, input: UpdateTaskLabel): Promise<TaskLabelDto> {
  const { data } = await apiClient.patch<Envelope<TaskLabelDto>>(`/task-labels/${id}`, input);
  return data.data;
}
export async function deleteTaskLabel(id: string): Promise<void> {
  await apiClient.delete(`/task-labels/${id}`);
}
