
import type {
  CreateFlashcardInput,
  CreateMemoryDeckInput,
  Flashcard,
  MemoryDeck,
  MemoryReviewLog,
  MemoryStats,
  ReviewFlashcardInput,
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
    // Appropriate when authentication uses an HTTP-only cookie.
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error ?? "Memory request failed."
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getMemoryDecks(): Promise<MemoryDeck[]> {
  return request<MemoryDeck[]>("/api/memories/decks");
}

export async function createMemoryDeck(
  input: CreateMemoryDeckInput
): Promise<MemoryDeck> {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Please enter a deck name.");
  }

  return request<MemoryDeck>("/api/memories/decks", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      title,
      description: input.description?.trim() ?? "",
    }),
  });
}

export async function addMemoryCard(
  input: CreateFlashcardInput
): Promise<Flashcard> {
  const front = input.front.trim();
  const back = input.back.trim();

  if (!front || !back) {
    throw new Error(
      "Both the question and answer are required."
    );
  }

  return request<Flashcard>("/api/memories/cards", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      front,
      back,
    }),
  });
}

export async function getDailyReviewCards(): Promise<
  { card: Flashcard; deckId: number | null; deckTitle: string }[]
> {
  return request("/api/memories/review/due");
}

export async function reviewMemoryCard(
  input: ReviewFlashcardInput
): Promise<void> {
  return request("/api/memories/review", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMemoryStats(): Promise<MemoryStats> {
  return request<MemoryStats>("/api/memories/stats");
}
