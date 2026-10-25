import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  
  import { habitsApi } from "./api";
  import type {
    Habit,
    CreateHabitInput,
    UpdateHabitInput,
  } from "./types";
  
  export const habitsQueryKey = ["habits"] as const;
  
  export function useHabits() {
    return useQuery<Habit[], Error>({
      queryKey: habitsQueryKey,
      queryFn: () => habitsApi.getHabits(),
    });
  }
  
  export function useCreateHabit() {
    const queryClient = useQueryClient();
  
    return useMutation<Habit, Error, CreateHabitInput>({
      mutationFn: async (input: CreateHabitInput) => {
        return habitsApi.createHabit(input);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: habitsQueryKey,
        });
      },
    });
  }
  
  export function useUpdateHabit() {
    const queryClient = useQueryClient();
  
    return useMutation<
      Habit,
      Error,
      { id: string; input: UpdateHabitInput }
    >({
      mutationFn: async ({
        id,
        input,
      }: {
        id: string;
        input: UpdateHabitInput;
      }) => {
        return habitsApi.updateHabit(id, input);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: habitsQueryKey,
        });
      },
    });
  }
  
  export function useToggleHabitCompletion() {
    const queryClient = useQueryClient();
  
    return useMutation<
      Habit,
      Error,
      { id: string; date: string }
    >({
      mutationFn: async({
        id,
        date,
      }: {
        id: string;
        date: string;
      }) => {
        return habitsApi.toggleCompletion(id, date);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: habitsQueryKey,
        });
      },
    });
  }
  
  export function useDeleteHabit() {
    const queryClient = useQueryClient();
  
    return useMutation<void, Error, string>({
      mutationFn: async (id: string) => {
        return habitsApi.deleteHabit(id);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: habitsQueryKey,
        });
      },
    });
  }
  