"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import Logo from "./Logo";
import { navItems } from "../data/navigation";
import { useUserData } from "@/features/auth/queries";
import { useRouter } from "next/navigation";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const {data,isPending,isError} = useUserData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();


  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  /* ---------------------------- presentation only --------------------------- */

  const initial = data?.username?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#f4f3ef] lg:p-5">
      <div className="mx-auto flex min-h-screen max-w-[1440px] overflow-hidden bg-[#fbfaf7] shadow-[0_24px_80px_rgba(39,39,32,0.10)] lg:min-h-[calc(100vh-40px)] lg:rounded-[28px] lg:border lg:border-black/[0.04]">
     
        {/* Shared sidebar: desktop only */}
        <aside className="relative hidden w-[248px] shrink-0 flex-col border-r border-[#e9e6df] bg-gradient-to-b from-[#fdfcfa] to-[#f7f6f2] p-5 lg:flex">
          <div className="px-2 pt-1">
            <Logo />
          </div>

          <p className="mt-9 px-3 text-xs font-bold text-[#a0a19b]">Menu</p>

          <nav aria-label="Main" className="mt-3 flex flex-1 flex-col gap-1.5">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none ${focusRing} ${
                    active
                      ? "bg-white text-[#242521] shadow-[0_8px_22px_rgba(40,40,35,0.08)] ring-1 ring-[#ecebe5]"
                      : "text-[#777870] hover:bg-white/70 hover:text-[#242521]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -left-5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#f16f3a] transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors ${
                      active
                        ? "bg-[#f16f3a] text-white shadow-[0_6px_14px_rgba(241,111,58,0.35)]"
                        : "bg-[#efeee9] text-[#85867f] group-hover:bg-[#e7e5df] group-hover:text-[#242521]"
                    }`}
                  >
                    <Icon name={item.icon} size={17} />
                  </span>

                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#242521] p-4 text-white shadow-[0_14px_30px_rgba(36,37,33,0.2)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-[#f16f3a]/25 blur-2xl"
            />
            <span className="relative grid size-8 place-items-center rounded-lg bg-white/10 text-[#f16f3a]">
              <Icon name="flame" size={15} />
            </span>
            <p className="relative mt-3 text-sm font-extrabold tracking-[-0.2px]">
              Make today count
            </p>
            <p className="relative mt-1 text-xs leading-5 text-white/55">
              Small steps, every day, add up.
            </p>
          </div>
        </aside>

        {/* One content column for desktop AND mobile */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop header */}
          <header className="hidden items-center justify-between border-b border-[#e9e6df] bg-white/60 px-8 py-4 backdrop-blur lg:flex">
            <div className="min-w-0">
              {isPending ? (
                <div
                  className="h-6 w-48 animate-pulse rounded-lg bg-[#efeee9] motion-reduce:animate-none"
                  aria-label="Loading your profile"
                />
              ) : (
                <h1 className="truncate text-lg font-extrabold tracking-[-0.4px] text-[#242521]">
                  Welcome, {data?.username}
                </h1>
              )}
              <p className="mt-0.5 text-xs font-semibold text-[#a0a19b]">
                {isError
                  ? "We couldn’t load your profile."
                  : "Here’s what’s on your plate today."}
              </p>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Open user menu"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className={`grid size-10 place-items-center rounded-full bg-[#e8ddd3] text-sm font-extrabold text-[#6e5444] shadow-sm ring-2 ring-white transition hover:cursor-pointer hover:ring-[#f16f3a]/50 ${focusRing}`}
              >
                {initial}
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full z-50 w-60 pt-2">
                  <div
                    role="menu"
                    className="overflow-hidden rounded-2xl border border-[#e9e6df] bg-white p-2 shadow-[0_18px_44px_rgba(40,40,35,0.14)]"
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8ddd3] text-xs font-extrabold text-[#6e5444]">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#242521]">
                          {data?.username}
                        </p>
                        <p className="text-xs font-semibold text-[#a0a19b]">
                          Signed in
                        </p>
                      </div>
                    </div>

                    <div className="my-1 border-t border-[#f0eee9]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 ${focusRing}`}
                    >
                      <Icon name="logout" size={16} />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Mobile header */}
          {!isHome && (
            <header className="flex items-center justify-between px-5 pb-4 pt-6 lg:hidden">
              <Logo />

              <div
              className="relative"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Open user menu"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className={`grid size-10 place-items-center rounded-full bg-[#e8ddd3] text-sm font-extrabold text-[#6e5444] shadow-sm ring-2 ring-white transition hover:cursor-pointer hover:ring-[#f16f3a]/50 ${focusRing}`}
              >
                {initial}
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full z-50 w-60 pt-2">
                  <div
                    role="menu"
                    className="overflow-hidden rounded-2xl border border-[#e9e6df] bg-white p-2 shadow-[0_18px_44px_rgba(40,40,35,0.14)]"
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8ddd3] text-xs font-extrabold text-[#6e5444]">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#242521]">
                          {data?.username}
                        </p>
                        <p className="text-xs font-semibold text-[#a0a19b]">
                          Signed in
                        </p>
                      </div>
                    </div>

                    <div className="my-1 border-t border-[#f0eee9]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 ${focusRing}`}
                    >
                      <Icon name="logout" size={16} />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
              
            </header>
          )}

          {/* The current Next.js route renders here, exactly once */}
          <main className="min-w-0 flex-1 px-5 pb-28 pt-4 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-20 flex w-[calc(100%-24px)] max-w-[406px] -translate-x-1/2 items-center justify-around rounded-[24px] border border-white/[0.06] bg-[#232420]/95 px-2 py-2 text-white shadow-[0_18px_44px_rgba(24,24,21,0.32)] backdrop-blur-md lg:hidden"
      >
        {navItems.slice(0, 5).map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[52px] min-w-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a58] ${
                active ? "bg-white/10 text-[#ff8a58]" : "text-white/50 active:bg-white/5"
              }`}
            >
              <Icon name={item.icon} size={19} />
              <span className="text-[10px] font-bold leading-none">
                {item.label === "Overview"
                  ? "Home"
                  : item.label
                      .replace("My ", "")
                      .replace("Focus ", "")}
              </span>
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-[#ff8a58]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}