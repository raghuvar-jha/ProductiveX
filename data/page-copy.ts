import type { Page } from "../types/Page";

export const pageCopy: Record<Exclude<Page, "overview">, { eyebrow: string; title: string; description: string }> = {
  tasks: {
    eyebrow: "My workspace",
    title: "Tasks",
    description: "Turn your plans into progress, one clear step at a time.",
  },
  memories: {
    eyebrow: "Knowledge library",
    title: "Memories",
    description: "Build a memory that lasts with focused daily reviews.",
  },
  timer: {
    eyebrow: "Focus space",
    title: "Focus timer",
    description: "Protect your attention and make space for meaningful work.",
  },
  habits: {
    eyebrow: "Personal growth",
    title: "Habits",
    description: "Small actions, repeated consistently, create lasting change.",
  },
}
