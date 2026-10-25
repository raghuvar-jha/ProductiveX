import { useQuery } from "@tanstack/react-query";

type UserData = {
  username: string;
  login: boolean;
};

async function fetchUserData(): Promise<UserData> {
  const response = await fetch("/api/user", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}


export function useUserData() {
  return useQuery({
    queryKey: ["username"],
    queryFn: fetchUserData,
  });
}