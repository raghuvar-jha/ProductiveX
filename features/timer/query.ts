import {
    useMutation,
    useQuery,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import { focusApi } from "./api";
  import type { CreateFocusSessionInput } from "./types";
  
  export const focusKeys = {
    all: ["focus-sessions"] as const,
  };
  
  export function useFocusSessions() {
    return useQuery({
      queryKey: focusKeys.all,
      queryFn: focusApi.getSessions,
    });
  }
  
  export function useCreateFocusSession() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (input: CreateFocusSessionInput) =>
        focusApi.createSession(input),
  
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: focusKeys.all,
        }),
    });
  }
  
  export function useDeleteFocusSession() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (id: string) => focusApi.deleteSession(id),
  
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: focusKeys.all,
        }),
    });
  }
  
  export function useClearFocusSessions() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: () => focusApi.clearSessions(),
  
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: focusKeys.all,
        }),
    });
  }