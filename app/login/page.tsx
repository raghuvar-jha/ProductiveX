
"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Login from "@/component/Login";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogin(data: {
    email: string;
    password: string;
  }) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error ||
          result.message ||
          "Invalid email or password. Please try again."
      );
    }

 
    await queryClient.invalidateQueries();


    router.replace("/dashboard");
    router.refresh();
  }

  return <Login onLogin={handleLogin} />;
}
