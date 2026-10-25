
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "./types";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    // Include this if your authentication uses cookies.
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Task request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const tasksApi = {
  getTasks: (): Promise<Task[]> =>
    request("/api/tasks"),

  getTask: (id: number): Promise<Task> =>
    request(`/api/tasks/${id}`),

  createTask: (data: CreateTaskInput): Promise<Task> =>
    request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTask: (
    id: number,
    data: UpdateTaskInput
  ): Promise<Task> =>
    request(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number): Promise<void> =>
    request(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
};
