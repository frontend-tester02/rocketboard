'use client';

import type { BoardWithTasks, TaskDto } from '@rocket/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  addColumn,
  addComment,
  createTask,
  createTaskLabel,
  deleteTask,
  deleteTaskLabel,
  getBoard,
  listBoards,
  listComments,
  listTaskLabels,
  moveTask,
  removeColumn,
  updateColumn,
  updateTask,
  updateTaskLabel,
} from '@/features/tasks/api';

export const taskKeys = {
  boards: ['tasks', 'boards'] as const,
  board: (id: string) => ['tasks', 'board', id] as const,
  labels: ['tasks', 'labels'] as const,
};

export function useBoards() {
  return useQuery({ queryKey: taskKeys.boards, queryFn: listBoards });
}

export function useBoard(id: string | null) {
  return useQuery({
    queryKey: taskKeys.board(id ?? ''),
    queryFn: () => getBoard(id!),
    enabled: !!id,
  });
}

export function useTaskLabels() {
  return useQuery({ queryKey: taskKeys.labels, queryFn: listTaskLabels, staleTime: 5 * 60 * 1000 });
}

function useBoardMutations(boardId: string) {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: taskKeys.board(boardId) });
  return { qc, invalidate };
}

export function useCreateTask(boardId: string) {
  const { invalidate } = useBoardMutations(boardId);
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      invalidate();
      toast.success('Task added');
    },
  });
}

export function useUpdateTask(boardId: string) {
  const { invalidate } = useBoardMutations(boardId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(boardId: string) {
  const { invalidate } = useBoardMutations(boardId);
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      invalidate();
      toast.success('Task deleted');
    },
  });
}

/** Optimistic move: patch the board cache immediately, revert on error. */
export function useMoveTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, columnId, order }: { id: string; columnId: string; order: number }) =>
      moveTask(id, { columnId, order }),
    onMutate: async ({ id, columnId, order }) => {
      await qc.cancelQueries({ queryKey: taskKeys.board(boardId) });
      const prev = qc.getQueryData<BoardWithTasks>(taskKeys.board(boardId));
      if (prev) {
        qc.setQueryData<BoardWithTasks>(taskKeys.board(boardId), {
          ...prev,
          tasks: prev.tasks.map((t: TaskDto) =>
            t.id === id ? { ...t, columnId, order } : t,
          ),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(taskKeys.board(boardId), ctx.prev);
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: taskKeys.board(boardId) }),
  });
}

function useInvalidateLabels() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: taskKeys.labels });
}

export function useCreateTaskLabel() {
  const invalidate = useInvalidateLabels();
  return useMutation({
    mutationFn: createTaskLabel,
    onSuccess: () => {
      invalidate();
      toast.success('Label created');
    },
  });
}

export function useUpdateTaskLabel() {
  const invalidate = useInvalidateLabels();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTaskLabel>[1] }) =>
      updateTaskLabel(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTaskLabel() {
  const invalidate = useInvalidateLabels();
  return useMutation({
    mutationFn: deleteTaskLabel,
    onSuccess: () => {
      invalidate();
      toast.success('Label deleted');
    },
  });
}

export function useComments(taskId: string | null) {
  return useQuery({
    queryKey: ['tasks', 'comments', taskId ?? ''],
    queryFn: () => listComments(taskId!),
    enabled: !!taskId,
  });
}

export function useAddComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => addComment(taskId, text),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks', 'comments', taskId] }),
  });
}

export function useAddColumn(boardId: string) {
  const { invalidate } = useBoardMutations(boardId);
  return useMutation({
    mutationFn: (input: Parameters<typeof addColumn>[1]) => addColumn(boardId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateColumn(boardId: string) {
  const { invalidate } = useBoardMutations(boardId);
  return useMutation({
    mutationFn: ({ columnId, input }: { columnId: string; input: Parameters<typeof updateColumn>[2] }) =>
      updateColumn(boardId, columnId, input),
    onSuccess: invalidate,
  });
}

export function useRemoveColumn(boardId: string) {
  const { invalidate } = useBoardMutations(boardId);
  return useMutation({
    mutationFn: (columnId: string) => removeColumn(boardId, columnId),
    onSuccess: () => {
      invalidate();
      toast.success('Column removed');
    },
  });
}
