
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
} from "./types";

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
    // Assumes your authentication uses an HTTP-only cookie.
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Habit request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const habitsApi = {
  getHabits(): Promise<Habit[]> {
    return request<Habit[]>("/api/habits");
  },

  getHabit(id: string): Promise<Habit> {
    return request<Habit>(`/api/habits/${id}`);
  },

  createHabit(input: CreateHabitInput): Promise<Habit> {
    return request<Habit>("/api/habits", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateHabit(
    id: string,
    input: UpdateHabitInput
  ): Promise<Habit> {
    return request<Habit>(`/api/habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  toggleCompletion(id: string, date: string): Promise<Habit> {
    return request<Habit>(`/api/habits/${id}/completion`, {
      method: "PATCH",
      body: JSON.stringify({ date }),
    });
  },

  deleteHabit(id: string): Promise<void> {
    return request<void>(`/api/habits/${id}`, {
      method: "DELETE",
    });
  },
};
