
"use client";

import { useQuery } from "@tanstack/react-query";

export type UserData = {
  username: string;
  login: boolean;
};

async function fetchUser(): Promise<UserData> {
  const response = await fetch("/api/user", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

export function useUserData() {
  return useQuery<UserData>({
    queryKey: ["username"],
    queryFn: fetchUser,
    staleTime: 0,
    retry: false,
  });
}
