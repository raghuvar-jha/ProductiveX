
import {
    useMutation,
    useQuery,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    addMemoryCard,
    createMemoryDeck,
    getDailyReviewCards,
    getMemoryDecks,
    getMemoryStats,
    reviewMemoryCard,
  } from "./api";
  
  import type {
    CreateFlashcardInput,
    CreateMemoryDeckInput,
    ReviewFlashcardInput,
  } from "./types";
  
  const keys = {
    decks: ["memories", "decks"],
    daily: ["memories", "daily-review"],
    stats: ["memories", "stats"],
  };
  
  export function useMemoryDecks() {
    return useQuery({
      queryKey: keys.decks,
      queryFn: getMemoryDecks,
    });
  }
  
  export function useDailyReviewCards() {
    return useQuery({
      queryKey: keys.daily,
      queryFn: getDailyReviewCards,
    });
  }
  
  export function useMemoryStats() {
    return useQuery({
      queryKey: keys.stats,
      queryFn: getMemoryStats,
    });
  }
  
  function useRefreshMemories() {
    const queryClient = useQueryClient();
  
    return () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.decks }),
        queryClient.invalidateQueries({ queryKey: keys.daily }),
        queryClient.invalidateQueries({ queryKey: keys.stats }),
      ]);
  }
  
  export function useCreateMemoryDeck() {
    const refresh = useRefreshMemories();
  
    return useMutation({
      mutationFn: (input: CreateMemoryDeckInput) =>
        createMemoryDeck(input),
      onSuccess: refresh,
    });
  }
  
  export function useAddMemoryCard() {
    const refresh = useRefreshMemories();
  
    return useMutation({
      mutationFn: (input: CreateFlashcardInput) =>
        addMemoryCard(input),
      onSuccess: refresh,
    });
  }
  
  export function useReviewMemoryCard() {
    const refresh = useRefreshMemories();
  
    return useMutation({
      mutationFn: (input: ReviewFlashcardInput) =>
        reviewMemoryCard(input),
      onSuccess: refresh,
    });
  }
  