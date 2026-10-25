
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { navItems } from "@/data/navigation";
import Icon from "./Icon";
import Logo from "./Logo";
import { useUserData } from "@/features/auth/queries";


type UserData = {
  username: string;
  login: boolean;
};



export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const {
    data,
    isPending,
    isError,
  } = useUserData();

  const isLoggedIn = !isPending && !isError && data?.login === true;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Immediately remove cached user information.
   

      // Remove cached data belonging to the previous user.
      queryClient.clear();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hide the sidebar while checking the session or when logged out.
  if (isPending || isError || !isLoggedIn) {
    return null;
  }

  return (
    <aside className="flex min-h-screen w-[218px] shrink-0 flex-col border-r border-[#e9e7e1] bg-[#f7f6f2] px-5 py-6">
      <Logo />

      <div className="mt-10 flex-1">
        <nav aria-label="Main navigation" className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-bold transition ${
                pathname === item.href
                  ? "bg-[#22231f] text-white shadow-sm"
                  : "text-[#7a7b75] hover:bg-white hover:text-[#31322f]"
              }`}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 border-t border-[#e9e7e1] pt-4">
        <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f16f3a] text-sm font-extrabold uppercase text-white shadow-sm shadow-orange-200">
            {data.username?.trim().charAt(0) || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-extrabold text-[#343531]">
              {data.username || "User"}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-[#858680]">
              Signed in
            </p>
          </div>

          <span className="size-2 shrink-0 rounded-full bg-[#43a879]" />
        </div>

        {logoutError && (
          <p role="alert" className="mb-2 px-2 text-[10px] text-red-600">
            {logoutError}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold text-[#7a7b75] transition hover:bg-[#fce9e5] hover:text-[#c64e3c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="logout" size={16} />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </aside>
  );
}
