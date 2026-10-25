
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Login from "@/component/Login";
import { useUserData } from "@/features/auth/queries";

export default function LoginPage() {

  

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isPending } = useUserData();

  // Redirect only after React has committed the render.
  useEffect(() => {
    if (data?.login) {
      router.replace("/dashboard");
    }
  }, [data?.login, router]);

  async function handleLogin(credentials: {
    email: string;
    password: string;
  }) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.error ??
          result?.message ??
          "Unable to log in. Please try again."
      );
    }

    // Refresh cached authentication data after the cookie is set.
    await queryClient.invalidateQueries({
      queryKey: ["username"],
    });

    // Navigate after successful login.
    router.replace("/dashboard");
  }

  // Avoid showing the login form while checking authentication
  // or redirecting an already authenticated user.
  if (isPending || data?.login) {
    return <>
  
  <main className="flex min-h-screen items-center justify-center bg-[#f4f3ef]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e4e1d9] border-t-[#242521]" />

        <p className="text-sm text-[#77766f]">
          Checking your session...
        </p>
      </div>
    </main>
    
    </>;
  }

  return <Login onLogin={handleLogin} />;
}
