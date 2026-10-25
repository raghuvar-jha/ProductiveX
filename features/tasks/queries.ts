
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { tasksApi } from "./api";

import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from "./types";

export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: number) => ["tasks", id] as const,
};

// Fetch all tasks
// Fetch all tasks
export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: tasksApi.getTasks,
  });
}
// Fetch a single task
export function useTask(id: number) {
  return useQuery<Task>({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: Number.isFinite(id),
  });
}

// Create a task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      tasksApi.createTask(data),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      }),
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateTaskInput;
    }) => tasksApi.updateTask(id, data),

    onSuccess: (updatedTask) => {
      // Update the individual task cache when the API returns a task.
      if (updatedTask && typeof updatedTask === "object" && "id" in updatedTask) {
        queryClient.setQueryData(
          taskKeys.detail(updatedTask.id as number),
          updatedTask
        );
      }

      // Refresh the list so changes appear in the task columns.
      return queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      tasksApi.deleteTask(id),

    onSuccess: (_result, deletedId) => {
      queryClient.removeQueries({
        queryKey: taskKeys.detail(deletedId),
      });

      return queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}
