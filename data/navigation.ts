import { LinkProps } from "next/link";
import type { IconName } from "../types/IconName";

export const navItems: { icon: IconName; label: string, href: string }[] = [
  { icon: "home", label: "Overview" , href:"/dashboard"},
  { icon: "task", label: "Tasks",href:"/task" },
  { icon: "cards", label: "Memories",href: "/memories"},
  { icon: "timer", label: "Focus",href: "/timer"},
  { icon: "habit", label: "Habits",href: "/habits"},
];
