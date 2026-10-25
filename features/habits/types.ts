
import type { IconName } from "@/types/IconName";

export type HabitFrequency =
  | "daily"
  | "weekdays"
  | "weekly"
  | "custom";

export type Habit = {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  scheduledDays: number[];
  goal: string;
  color: string;
  icon: IconName;
  createdAt: string;
  completions: string[];
};

export type CreateHabitInput = {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  scheduledDays: number[];
  goal: string;
  color: string;
  icon: IconName;
};

export type UpdateHabitInput = Partial<CreateHabitInput>;
