import type { IconName } from "./IconName";

export type Flashcard = {
  id: number;
  front: string;
  back: string;
};

export type MemoryDeck = {
  id: number;
  title: string;
  description: string;
  total: number;
  due: number;
  color: string;
  icon: IconName;
  cards: Flashcard[];
};
