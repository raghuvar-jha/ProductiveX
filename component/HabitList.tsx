"use client";

import Icon from "./Icon";
import type { IconName } from "@/types/IconName";
import {
  useHabits,
  useToggleHabitCompletion,
} from "@/features/habits/queries";

type Habit = {
  id: string;
  name: string;
  description?: string | null;
  frequency: "daily" | "weekdays" | "weekly" | "custom";
  targetPerWeek: number;
  scheduledDays: number[];
  goal: string;
  color: string;
  icon: IconName;
  createdAt: string;
  completions: string[];
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDates() {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();

  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
  monday.setHours(12, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return getLocalDateString(date);
  });
}

function getStreak(completions: string[]) {
  const completed = new Set(completions);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (!completed.has(getLocalDateString(today))) {
    today.setDate(today.getDate() - 1);
  }

  let streak = 0;

  while (completed.has(getLocalDateString(today))) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  return streak;
}

export default function HabitList() {
  const habitsQuery = useHabits();
  const toggleCompletion = useToggleHabitCompletion();

  const habits: Habit[] = habitsQuery.data ?? [];
  const weekDates = getWeekDates();
  const today = getLocalDateString(new Date());

  if (habitsQuery.isPending) {
    return (
      <div className="space-y-2.5" aria-busy="true" aria-label="Loading your habits">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-[76px] animate-pulse rounded-2xl bg-[#f4f3ef] motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (habitsQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center">
        <p className="text-sm font-bold text-red-700">
          {habitsQuery.error instanceof Error
            ? habitsQuery.error.message
            : "Could not load your habits."}
        </p>

        <button
          type="button"
          onClick={() => void habitsQuery.refetch()}
          className="mt-3 h-10 rounded-xl bg-white px-5 text-xs font-bold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a]"
        >
          Retry
        </button>
      </div>
    );
  }

  function handleToggleCompletion(habit: Habit, date: string) {
    toggleCompletion.mutate({
      id: habit.id,
      date,
    });
  }

  return (
    <div className="space-y-2.5">
      {toggleCompletion.isError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600"
        >
          {toggleCompletion.error instanceof Error
            ? toggleCompletion.error.message
            : "Could not update habit completion. Please try again."}
        </p>
      )}

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dedcd5] bg-[#faf9f6] px-5 py-9 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#fff0e9] text-[#f16f3a]">
            <Icon name="flame" size={20} />
          </div>
          <p className="mt-3 text-sm font-extrabold text-[#373832]">
            No habits yet
          </p>
          <p className="mx-auto mt-1 max-w-[30ch] text-xs leading-5 text-[#a0a19b]">
            Create a habit to start tracking.
          </p>
        </div>
      ) : (
        habits.map((habit) => {
          const completions = new Set(habit.completions ?? []);
          const streak = getStreak(habit.completions ?? []);
          const doneThisWeek = weekDates.filter((date) =>
            completions.has(date)
          ).length;
          const accent = habit.color || "bg-[#282925]";

          return (
            /*
              Each habit is a soft card. It wraps on its own: on a narrow card
              the day boxes drop under the name and spread across the full
              width, so the name is never covered or squeezed.
            */
            <div
              key={habit.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-[#efede8] bg-[#faf9f6] p-3 transition-all duration-200 hover:border-[#e4e2db] hover:bg-white hover:shadow-[0_8px_22px_rgba(40,40,35,0.06)] motion-reduce:transition-none sm:p-3.5"
            >
              {/* Icon + name + meta */}
              <div className="flex min-w-0 flex-[1_1_160px] items-center gap-3">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-[13px] text-white shadow-[0_6px_14px_rgba(40,40,35,0.16)] ${accent}`}
                >
                  <Icon name={habit.icon} size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words text-[15px] font-extrabold leading-5 tracking-[-0.2px] text-[#373833]">
                    {habit.name.charAt(0).toUpperCase() + habit.name.slice(1).toLowerCase()}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        streak > 0
                          ? "bg-[#fff0e9] text-[#e96330]"
                          : "bg-[#efeee9] text-[#a0a19b]"
                      }`}
                    >
                      <Icon name="flame" size={11} />
                      {streak}
                    </span>

                    <span className="text-[11px] font-semibold text-[#a0a19b]">
                      {doneThisWeek} this week
                    </span>
                  </div>
                </div>
              </div>

              {/* Day boxes: small, evenly spaced, in a soft tray */}
              <div className="flex flex-[1_1_200px] justify-between gap-1 rounded-xl border border-[#f0eee9] bg-white p-1.5 sm:max-w-[236px] sm:justify-end sm:gap-1.5">
                {weekDates.map((date, index) => {
                  const completed = completions.has(date);
                  const isFuture = date > today;
                  const isToday = date === today;

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={isFuture || toggleCompletion.isPending}
                      onClick={() => handleToggleCompletion(habit, date)}
                      aria-label={`${habit.name}: ${date}${
                        completed ? ", completed" : ", not completed"
                      }`}
                      aria-pressed={completed}
                      title={date}
                      className={`relative grid size-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold transition-all duration-150 after:absolute after:-inset-1 after:content-[''] hover:enabled:scale-110 active:enabled:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] disabled:cursor-not-allowed motion-reduce:transition-none ${
                        completed
                          ? `${accent} text-white shadow-[0_3px_8px_rgba(40,40,35,0.18)]`
                          : isFuture
                            ? "bg-[#f6f5f1] text-[#d3d4cd]"
                            : isToday
                              ? "bg-[#fff0e9] text-[#e96330] ring-2 ring-[#f16f3a]/40"
                              : "bg-[#f2f1ed] text-[#a3a49d] hover:bg-[#e9e7e1]"
                      }`}
                    >
                      {completed ? (
                        <Icon name="check" size={11} />
                      ) : (
                        DAY_LABELS[index]
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}