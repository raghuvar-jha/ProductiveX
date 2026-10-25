import type { IconName } from "../types/IconName";

export const tasks = [
  {
    title: "Review quarterly roadmap",
    meta: "Work · 10:00 AM",
    tag: "High",
    color: "orange",
  },
  {
    title: "Practice Spanish vocabulary",
    meta: "Learning · 20 min",
    tag: "Study",
    color: "purple",
  },
  {
    title: "Book dentist appointment",
    meta: "Personal · Today",
    tag: "",
    color: "green",
  },
]

export const habits = [
  {
    name: "Morning stretch",
    streak: "12 days",
    done: 5,
    icon: "heart" as IconName,
  },
  {
    name: "Read 20 pages",
    streak: "8 days",
    done: 4,
    icon: "book" as IconName,
  },
  {
    name: "Deep work",
    streak: "21 days",
    done: 6,
    icon: "briefcase" as IconName,
  },
]
