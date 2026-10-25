"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import Logo from "./Logo";
import { navItems } from "../data/navigation";
import TasksPage from "./TasksPage";
import FocusPage from "./FocusPage";
import HabitsPage from "./HabitsPage";
import MemoriesPage from "./MemoriesPage";
import Dashboard from "./Dashboard";
import HomePage from "./HomePage";

export default function MobileApp() {
  const pathname = usePathname();


  return (
    <div className="min-h-screen bg-[#f5f4f0] lg:hidden">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#fbfaf7] pb-28 shadow-xl">
        {/* Mobile header */}
        <div className={`${pathname=='/'?"hidden":""}`}>

        <header className="flex items-center justify-between px-5 pb-4 pt-6">
          <Logo />

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-xl border border-[#e9e6df] bg-white text-[#62635e]"
              >
              <Icon name="bell" size={17} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#f16f3a] ring-2 ring-white" />
            </button>

            <div className="grid size-9 place-items-center rounded-full bg-[#e8ddd3] text-[10px] font-extrabold text-[#6e5444]">
              AM
            </div>
          </div>
        </header>
              </div>

        {/* Current route content */}
        <main className="px-5">
          {pathname=='/task' && <TasksPage compact={true}/> }
          {pathname=='/timer' && <FocusPage compact={true}/> }
          {pathname=='/habits' && <HabitsPage compact={true}/> }
          {pathname=='/memories' && <MemoriesPage compact={true}/> }
          {pathname=='/dashboard' && <Dashboard/> }
          {pathname=='/' && <HomePage/> }
        </main>

        {/* Mobile bottom navigation */}
        <nav
          aria-label="Mobile navigation"
          className="fixed bottom-3 left-1/2 z-20 flex w-[calc(100%-24px)] max-w-[406px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-black/[0.05] bg-[#232420]/95 px-2 py-2.5 text-white shadow-[0_14px_40px_rgba(24,24,21,0.25)] backdrop-blur"
        >
          {navItems.slice(0, 5).map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-w-[52px] flex-col items-center gap-1.5 rounded-xl py-1.5 transition-colors ${
                  isActive ? "text-[#ff8a58]" : "text-white/45"
                }`}
              >
                <Icon name={item.icon} size={18} />

                <span className="text-[7px] font-bold">
                  {item.label === "Overview"
                    ? "Home"
                    : item.label.replace("My ", "").replace("Focus ", "")}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}