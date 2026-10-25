"use client";

import Link from "next/link";
import Icon from "./Icon";
import { useUserData } from "@/features/auth/queries";
import { usePathname } from "next/navigation";


const Navbar = () => {
  const { data, isPending, isError } = useUserData();
  console.log(data?.username)
  const pathname = usePathname();
  if(pathname=='/' || pathname=='/login'|| pathname=='/signup'){
    return (<>
    
    </>)
  }

  const isLoggedIn =
    !isPending && !isError && data?.login === true;

  // Avoid accessing user data before the query finishes.
  if (isPending) {
    return (
      <header className="flex h-[78px] items-center justify-between border-b border-[#ebe9e3] px-8">
        <div className="h-6 w-48 animate-pulse rounded bg-[#e9e7e1]" />
        <div className="size-9 animate-pulse rounded-full bg-[#e9e7e1]" />
      </header>
    );
  }

  // Handle a failed user request safely.
  const username = isLoggedIn ? data.username : "";

  return (
    <header className="flex h-[78px] items-center justify-between border-b border-[#ebe9e3] px-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#a4a59e]">
          Monday, June 16
        </p>

        <h1 className="text-[27px] font-extrabold tracking-[-1px] text-[#252621]">
          {isLoggedIn ? `Good morning, ${username}` : "Welcome to ProductiveX"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        {isLoggedIn && (
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-xl text-[#696a64] transition-colors hover:bg-[#f0eee8]"
          >
            <Icon name="bell" size={18} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#f16f3a] ring-2 ring-[#fbfaf7]" />
          </button>
        )}

        {/* User profile / Login */}
        {isLoggedIn ? (
          <button
            type="button"
            aria-label={`Profile for ${username}`}
            title={username}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f16f3a] text-sm font-extrabold uppercase text-white shadow-sm shadow-orange-200 transition-transform hover:scale-105"
          >
            {username.trim().charAt(0) || "U"}
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#242521] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#393a35]"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;