export type FocusMode = "pomodoro" | "shortBreak" | "longBreak";

export type AmbientSound = "none" | "rain" | "forest" | "cafe";

export type FocusSession = {
  id: string;
  mode: FocusMode;
  durationSeconds: number;
  completedAt: string;
};

export type CreateFocusSessionInput = {
  mode: FocusMode;
  durationSeconds: number;
};

export type FocusStats = {
  totalFocusSeconds: number;
  completedSessions: number;
};