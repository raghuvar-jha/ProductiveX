// features/memories/types.ts

export type MemoryRating = "again" | "hard" | "good" | "easy";

export type Flashcard = {
  id: number;
  front: string;
  back: string;
  createdAt?: string;
  dueAt?: string;
  intervalDays?: number;
  repetitions?: number;
  lastReviewedAt?: string;
};

export type MemoryDeck = {
  id: number;
  title: string;
  description: string;
  total: number;
  due: number;
  color: string;
  icon: string;
  cards: Flashcard[];
  createdAt?: string;
};

export type CreateMemoryDeckInput = {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
};

export type CreateFlashcardInput = {
  deckId: number;
  front: string;
  back: string;
};

export type ReviewFlashcardInput = {
  deckId: number | null;
  cardId: number;
  rating: MemoryRating;
};

export type MemoryReviewLog = {
  id: number;
  deckId: number | null;
  cardId: number;
  rating: MemoryRating;
  reviewedAt: string;
};

export type MemoryStats = {
  reviewedToday: number;
  rememberedToday: number;
  againToday: number;
  totalCards: number;
  dueCards: number;
  streak: number;
};