
import type {
  CreateFocusSessionInput,
  FocusSession,
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
    // Assumes JWT authentication uses an HTTP-only cookie.
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Focus session request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const focusApi = {
  getSessions(): Promise<FocusSession[]> {
    return request<FocusSession[]>("/api/focus");
  },

  createSession(
    input: CreateFocusSessionInput
  ): Promise<FocusSession> {
    return request<FocusSession>("/api/focus", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteSession(id: string): Promise<void> {
    return request<void>(`/api/focus/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  clearSessions(): Promise<void> {
    return request<void>("/api/focus", {
      method: "DELETE",
    });
  },
};
