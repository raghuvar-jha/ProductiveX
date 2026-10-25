"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { IconName } from "@/types/IconName";
import type {
  Habit,
  HabitFrequency,
  CreateHabitInput,
} from "@/features/habits/types";

import { getLocalDateString } from "@/features/habits/api";
import {
  useHabits,
  useCreateHabit,
  useDeleteHabit,
  useToggleHabitCompletion,
} from "@/features/habits/queries";

import Icon from "./Icon";
import PageHeading from "./PageHeading";

/* -------------------------------------------------------------------------- */
/*  Constants (unchanged)                                                     */
/* -------------------------------------------------------------------------- */

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const COLORS = [
  "bg-[#f16f3a]",
  "bg-[#8270c7]",
  "bg-[#4b9a75]",
  "bg-[#d49a3d]",
];

const ICONS: IconName[] = ["heart", "book", "briefcase", "cards"];

/* -------------------------------------------------------------------------- */
/*  Date + streak helpers (unchanged)                                         */
/* -------------------------------------------------------------------------- */

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getMonday(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function getWeekDates(date: Date) {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function formatWeek(dates: Date[]) {
  const first = dates[0];
  const last = dates[6];

  const firstMonth = first.toLocaleDateString("en-US", { month: "short" });
  const lastMonth = last.toLocaleDateString("en-US", { month: "short" });

  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${firstMonth} ${first.getDate()} – ${last.getDate()}`;
  }

  return `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}`;
}

function isScheduled(habit: Habit, date: Date) {
  if (habit.frequency === "weekly") return true;
  return habit.scheduledDays.includes(date.getDay());
}

function getCompletedInWeek(habit: Habit, dates: Date[]) {
  return dates.filter((date) => {
    return (
      isScheduled(habit, date) &&
      habit.completions.includes(getLocalDateString(date))
    );
  }).length;
}

function getWeeklyGoal(habit: Habit, dates: Date[]) {
  if (habit.frequency === "weekly") return habit.targetPerWeek;
  return dates.filter((date) => isScheduled(habit, date)).length;
}

function getStreak(habit: Habit) {
  let date = new Date();
  date.setHours(0, 0, 0, 0);

  if (habit.frequency === "weekly") {
    let streak = 0;
    let weekStart = getMonday(date);

    if (
      getCompletedInWeek(habit, getWeekDates(weekStart)) <
      habit.targetPerWeek
    ) {
      weekStart = addDays(weekStart, -7);
    }

    for (let i = 0; i < 520; i++) {
      const dates = getWeekDates(weekStart);

      if (getCompletedInWeek(habit, dates) < habit.targetPerWeek) break;

      streak++;
      weekStart = addDays(weekStart, -7);
    }

    return streak;
  }

  if (
    isScheduled(habit, date) &&
    !habit.completions.includes(getLocalDateString(date))
  ) {
    date = addDays(date, -1);
  }

  let streak = 0;

  for (let i = 0; i < 3650; i++) {
    if (!isScheduled(habit, date)) {
      date = addDays(date, -1);
      continue;
    }

    if (!habit.completions.includes(getLocalDateString(date))) break;

    streak++;
    date = addDays(date, -1);
  }

  return streak;
}

function getWeeklyScore(habits: Habit[], dates: Date[]) {
  let goal = 0;
  let completed = 0;

  for (const habit of habits) {
    goal += getWeeklyGoal(habit, dates);
    completed += getCompletedInWeek(habit, dates);
  }

  return goal === 0 ? 0 : Math.min(100, Math.round((completed / goal) * 100));
}

/* -------------------------------------------------------------------------- */
/*  Presentational pieces (no logic)                                          */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const ratio = total === 0 ? 0 : done / total;

  return (
    <div className="relative size-[96px] shrink-0 sm:size-[116px]">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#f16f3a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="text-[22px] font-extrabold leading-none tracking-[-1px] text-white sm:text-[26px]">
          {done}
          <span className="text-[13px] font-bold text-white/45 sm:text-[15px]">/{total}</span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HabitsPage({ compact }: { compact: boolean }) {
  const { data: habits = [], isLoading, isError } = useHabits();

  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const toggleCompletion = useToggleHabitCompletion();

  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [targetPerWeek, setTargetPerWeek] = useState(3);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState<IconName>("heart");
  const [error, setError] = useState("");

  const weekDates = useMemo(() => {
    const monday = getMonday(new Date());
    return getWeekDates(addDays(monday, weekOffset * 7));
  }, [weekOffset]);

  const todayString = getLocalDateString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eligibleToday = habits.filter((habit) => isScheduled(habit, today));
  const completedToday = eligibleToday.filter((habit) =>
    habit.completions.includes(todayString),
  ).length;

  const longestCurrentStreak = habits.reduce(
    (max, habit) => Math.max(max, getStreak(habit)),
    0,
  );

  const weeklyScore = getWeeklyScore(habits, weekDates);

  function resetForm() {
    setName("");
    setDescription("");
    setFrequency("daily");
    setTargetPerWeek(3);
    setSelectedDays([1, 2, 3, 4, 5]);
    setColor(COLORS[0]);
    setIcon("heart");
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function toggleDay(day: number) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    if (frequency === "custom" && selectedDays.length === 0) {
      setError("Select at least one day.");
      return;
    }

    const scheduledDays =
      frequency === "weekdays"
        ? [1, 2, 3, 4, 5]
        : frequency === "custom"
          ? selectedDays
          : ALL_DAYS;

    const goal =
      frequency === "daily"
        ? "Every day"
        : frequency === "weekdays"
          ? "Weekdays"
          : frequency === "weekly"
            ? `${targetPerWeek} times a week`
            : selectedDays
                .slice()
                .sort((a, b) => a - b)
                .map((day) => DAY_NAMES[day].slice(0, 3))
                .join(", ");

    const input: CreateHabitInput = {
      name: name.trim(),
      description: description.trim(),
      frequency,
      targetPerWeek: frequency === "weekly" ? targetPerWeek : 7,
      scheduledDays,
      goal,
      color,
      icon,
    };

    try {
      await createHabit.mutateAsync(input);
      closeForm();
    } catch {
      setError("Could not create the habit. Please try again.");
    }
  }

  async function handleToggle(habit: Habit, date: Date) {
    if (!isScheduled(habit, date)) return;
    if (getLocalDateString(date) > todayString) return;

    try {
      await toggleCompletion.mutateAsync({
        id: habit.id,
        date: getLocalDateString(date),
      });
    } catch {
      setError("Could not update completion. Please try again.");
    }
  }

  async function handleDelete(habit: Habit) {
    if (!window.confirm(`Delete "${habit.name}" and its history?`)) return;

    try {
      await deleteHabit.mutateAsync(habit.id);
    } catch {
      window.alert("Could not delete the habit. Please try again.");
    }
  }

  /* ---------------------------- presentation only --------------------------- */

  const remainingToday = eligibleToday.length - completedToday;
  const todayHeadline =
    eligibleToday.length === 0
      ? "Nothing scheduled today"
      : remainingToday === 0
        ? "All done for today"
        : `${remainingToday} ${remainingToday === 1 ? "habit" : "habits"} left today`;
  const todaySubline =
    eligibleToday.length === 0
      ? "Enjoy the rest day."
      : remainingToday === 0
        ? "Nice work. Keep the streak going tomorrow."
        : "Tap a day below to check it off.";

  /*
    Layout rule: phones and tablets (below lg) always use the stacked layout.
    From lg up, the wide table layout is used, unless `compact` is true,
    in which case the stacked layout is kept at every size.
  */
  const pagePadding = compact ? "px-4 pb-6 pt-4" : "px-4 pb-6 pt-4 sm:px-8 sm:py-7";
  const overviewGrid = compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]";
  const todaySpan = compact ? "col-span-2" : "col-span-2 lg:col-span-1";
  const rowGrid = compact
    ? "grid-cols-[1fr_auto]"
    : "grid-cols-[1fr_auto] lg:grid-cols-[minmax(190px,230px)_1fr_76px]";
  const cellsSpan = compact ? "col-span-2" : "col-span-2 lg:col-span-1";
  const stackedStreak = compact ? "flex" : "flex lg:hidden";
  const wideStreak = compact ? "hidden" : "hidden lg:flex";
  const dayHeader = compact ? "hidden" : "hidden lg:grid";
  const deleteVisibility = compact
    ? "opacity-100"
    : "opacity-100 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100";

  return (
    <div className={`w-full ${pagePadding}`}>
      <PageHeading page="habits" compact={compact} />

      {/* ------------------------------ Overview ------------------------------ */}
      <div className={`mt-5 grid gap-3 sm:mt-6 sm:gap-4 ${overviewGrid}`}>
        {/* Today: the one bold moment */}
        <div
          className={`relative flex items-center gap-4 overflow-hidden rounded-[24px] bg-[#242521] p-5 text-white shadow-[0_18px_40px_rgba(36,37,33,0.22)] sm:gap-6 sm:rounded-[26px] sm:p-6 ${todaySpan}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#f16f3a]/15 blur-3xl"
          />
          <ProgressRing done={completedToday} total={eligibleToday.length} />
          <div className="relative min-w-0">
            <p className="text-xs font-semibold text-white/55">Today</p>
            <p className="mt-1 text-[18px] font-extrabold leading-tight tracking-[-0.4px] sm:text-[20px]">
              {todayHeadline}
            </p>
            <p className="mt-1.5 max-w-[28ch] text-xs leading-5 text-white/55">
              {todaySubline}
            </p>
          </div>
        </div>

        {/* Longest streak */}
        <div className="flex flex-col justify-between rounded-[24px] border border-[#f3dccf] bg-[#fff0e9] p-4 sm:rounded-[26px] sm:p-5">
          <div className="grid size-9 place-items-center rounded-xl bg-white text-[#f16f3a] shadow-sm">
            <Icon name="flame" size={16} />
          </div>
          <div className="mt-5 sm:mt-6">
            <p className="text-[28px] font-extrabold leading-none tracking-[-1px] text-[#343530] sm:text-[30px]">
              {longestCurrentStreak}
              <span className="ml-0.5 text-base font-bold text-[#a8715a]">d</span>
            </p>
            <p className="mt-1.5 text-xs font-semibold text-[#8f7366]">Longest streak</p>
          </div>
        </div>

        {/* Weekly score */}
        <div className="flex flex-col justify-between rounded-[24px] border border-[#e1dcf5] bg-[#f0edff] p-4 sm:rounded-[26px] sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-[#7a6fa8]">This week</p>
            <p className="truncate text-[11px] font-bold text-[#8270c7]">
              {weekOffset === 0 ? "Current" : formatWeek(weekDates)}
            </p>
          </div>
          <div className="mt-5 sm:mt-6">
            <p className="text-[28px] font-extrabold leading-none tracking-[-1px] text-[#343530] sm:text-[30px]">
              {weeklyScore}
              <span className="ml-0.5 text-base font-bold text-[#8f84bb]">%</span>
            </p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80"
              role="progressbar"
              aria-label="Weekly score"
              aria-valuenow={weeklyScore}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#8270c7] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${weeklyScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#7a6fa8]">Weekly score</p>
          </div>
        </div>
      </div>

      {/* ------------------------------ Week board ----------------------------- */}
      <section className="mt-4 rounded-[24px] border border-[#e7e5df] bg-white p-4 shadow-[0_8px_30px_rgba(40,40,35,0.04)] sm:mt-5 sm:rounded-[26px] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold tracking-[-0.3px] text-[#30312c] sm:text-lg">
              {weekOffset === 0 ? "This week" : "Week view"}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#a0a19b]">
              {formatWeek(weekDates)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-[#f4f3ef] p-1">
              <button
                type="button"
                aria-label="Previous week"
                onClick={() => setWeekOffset((value) => value - 1)}
                className={`grid size-9 place-items-center rounded-lg text-[#77786f] transition hover:bg-white hover:text-[#242521] hover:shadow-sm ${focusRing}`}
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next week"
                disabled={weekOffset >= 0}
                onClick={() => setWeekOffset((value) => value + 1)}
                className={`grid size-9 place-items-center rounded-lg text-[#77786f] transition hover:bg-white hover:text-[#242521] hover:shadow-sm disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
              >
                <Chevron dir="right" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
              className={`flex h-11 items-center gap-1.5 rounded-xl bg-[#f16f3a] px-4 text-xs font-bold text-white shadow-[0_6px_16px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.98] ${focusRing}`}
            >
              <Icon name="plus" size={13} />
              Add habit
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-3" aria-busy="true" aria-label="Loading habits">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl bg-[#f4f3ef] motion-reduce:animate-none lg:h-14" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center">
            <p className="text-sm font-bold text-red-700">Habits didn’t load</p>
            <p className="mt-1 text-xs text-red-600">Check your connection and refresh the page.</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#dedcd5] bg-[#faf9f6] px-5 py-10 text-center sm:px-6 sm:py-12">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#fff0e9] text-[#f16f3a]">
              <Icon name="flame" size={20} />
            </div>
            <p className="mt-4 text-base font-extrabold text-[#343530]">
              Start building consistency
            </p>
            <p className="mx-auto mt-1 max-w-[34ch] text-xs leading-5 text-[#888983]">
              Create a habit and track your progress day by day.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`mt-5 h-11 rounded-xl bg-[#242521] px-5 text-xs font-bold text-white transition hover:bg-[#383932] ${focusRing}`}
            >
              Create your first habit
            </button>
          </div>
        ) : (
          <div className="mt-5">
            {/* Day header, aligned with the cell column (wide layout only) */}
            <div className={`mb-2 items-end gap-4 grid-cols-[minmax(190px,230px)_1fr_76px] ${dayHeader}`}>
              <span />
              <div className="flex items-center justify-between gap-1.5">
                {weekDates.map((date, index) => {
                  const isToday = getLocalDateString(date) === todayString;
                  return (
                    <div key={getLocalDateString(date)} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <span className={`text-[11px] font-bold ${isToday ? "text-[#f16f3a]" : "text-[#a0a19b]"}`}>
                        {DAY_LABELS[index]}
                      </span>
                      <span
                        className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                          isToday ? "bg-[#f16f3a] text-white" : "text-[#77786f]"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <span className="text-right text-[11px] font-bold text-[#a0a19b]">Streak</span>
            </div>

            <ul className="divide-y divide-[#f0eee9]">
              {habits.map((habit) => {
                const streak = getStreak(habit);
                const streakUnit = habit.frequency === "weekly" ? "w" : "d";

                return (
                  <li
                    key={habit.id}
                    className={`group grid items-center gap-x-3 gap-y-3 py-4 lg:gap-x-4 lg:py-3.5 ${rowGrid}`}
                  >
                    {/* Identity */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`grid size-11 shrink-0 place-items-center rounded-[14px] text-white shadow-[0_6px_14px_rgba(40,40,35,0.14)] ${habit.color}`}
                      >
                        <Icon name={habit.icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[17px] font-extrabold text-[#34352f]">
                          {habit.name.charAt(0).toUpperCase() + habit.name.slice(1).toLowerCase()}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-[#a1a29c]">
                          {habit.goal}
                        </p>
                      </div>
                      <button
                        type="button"
                        title="Delete habit"
                        aria-label={`Delete ${habit.name}`}
                        onClick={() => void handleDelete(habit)}
                        className={`grid size-9 shrink-0 place-items-center rounded-lg text-[#b4b5af] transition hover:bg-[#fdecea] hover:text-[#c05d51] ${deleteVisibility} ${focusRing}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    {/* Streak: stacked layout */}
                    <p
                      className={`items-center gap-1 justify-self-end rounded-full bg-[#fff0e9] px-2.5 py-1 text-[11px] font-extrabold text-[#e96330] ${stackedStreak}`}
                    >
                      <Icon name="flame" size={12} />
                      {streak}
                      {streakUnit}
                    </p>

                    {/* Day cells */}
                    <div className={`flex items-center justify-between gap-1.5 ${cellsSpan}`}>
                      {weekDates.map((date, index) => {
                        const dateString = getLocalDateString(date);
                        const done = habit.completions.includes(dateString);
                        const scheduled = isScheduled(habit, date);
                        const future = dateString > todayString;
                        const canToggle = scheduled && !future;
                        const isToday = dateString === todayString;

                        return (
                          <button
                            key={dateString}
                            type="button"
                            aria-pressed={done}
                            aria-label={`${habit.name}, ${DAY_NAMES[date.getDay()]}, ${dateString}`}
                            title={`${DAY_NAMES[date.getDay()]} ${dateString}`}
                            disabled={!canToggle || toggleCompletion.isPending}
                            onClick={() => void handleToggle(habit, date)}
                            className={`relative grid h-11 min-w-0 flex-1 place-items-center rounded-xl border transition active:scale-95 disabled:cursor-not-allowed lg:h-10 ${focusRing} ${
                              done
                                ? `${habit.color} border-transparent text-white shadow-[0_4px_10px_rgba(40,40,35,0.16)]`
                                : !scheduled
                                  ? "border-transparent bg-[#f7f6f2] text-[#d7d6cf]"
                                  : future
                                    ? "border-dashed border-[#e6e4de] bg-transparent text-[#c9cac4]"
                                    : `bg-[#faf9f6] text-[#b2b3ad] hover:border-[#f16f3a] hover:bg-[#fff6f1] ${
                                        isToday ? "border-[#f16f3a]/50" : "border-[#e6e4de]"
                                      }`
                            }`}
                          >
                            {done ? (
                              <Icon name="check" size={15} />
                            ) : (
                              <>
                                {/* Day letter: shown in stacked layout */}
                                <span
                                  className={`text-[11px] font-bold ${
                                    compact ? "" : "lg:hidden"
                                  } ${isToday && scheduled ? "text-[#f16f3a]" : ""}`}
                                >
                                  {DAY_LABELS[index]}
                                </span>
                                {/* Dot for unscheduled days: wide layout */}
                                {!scheduled && !compact && (
                                  <span className="hidden size-1 rounded-full bg-[#d7d6cf] lg:block" />
                                )}
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Streak: wide layout */}
                    <p
                      className={`items-center justify-end gap-1 justify-self-end rounded-full bg-[#fff0e9] px-2.5 py-1 text-xs font-extrabold text-[#e96330] ${wideStreak}`}
                    >
                      <Icon name="flame" size={12} />
                      {streak}
                      {streakUnit}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {error && !showForm && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
      </section>

      {/* ------------------------------ Create modal ------------------------------ */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#242521]/45 backdrop-blur-[3px] sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="habit-form-title"
            className="max-h-[94dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] border border-[#e7e5df] bg-[#fbfaf7] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_30px_80px_rgba(30,30,25,0.30)] sm:my-auto sm:max-h-[92vh] sm:rounded-[28px] sm:p-6"
          >
            {/* Grab handle (mobile sheet) */}
            <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dedcd5] sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="habit-form-title" className="text-xl font-extrabold tracking-[-0.4px] text-[#30312c]">
                  Create a habit
                </h2>
                <p className="mt-1 text-xs text-[#888983]">
                  Build a routine, one day at a time.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeForm}
                className={`grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0efea] text-[#77786f] transition hover:bg-[#e7e5df] hover:text-[#242521] ${focusRing}`}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Live preview */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e7e5df] bg-white p-3">
              <div className={`grid size-11 shrink-0 place-items-center rounded-[14px] text-white shadow-[0_6px_14px_rgba(40,40,35,0.14)] ${color}`}>
                <Icon name={icon} size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold text-[#34352f]">
                  {name.trim() || "Your new habit"}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-[#a1a29c]">
                  {frequency === "daily"
                    ? "Every day"
                    : frequency === "weekdays"
                      ? "Weekdays"
                      : frequency === "weekly"
                        ? `${targetPerWeek} times a week`
                        : selectedDays.length
                          ? selectedDays.map((day) => DAY_NAMES[day].slice(0, 3)).join(", ")
                          : "No days selected"}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-5">
              <div>
                <label htmlFor="habit-name" className="mb-1.5 block text-xs font-bold text-[#505149]">
                  Habit name
                </label>
                <input
                  id="habit-name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Read 20 pages"
                  className="h-12 w-full rounded-xl border border-[#e4e2db] bg-white px-3.5 text-base text-black outline-none transition placeholder:text-[#b2b3ad] focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/10 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="habit-description" className="mb-1.5 block text-xs font-bold text-[#505149]">
                  Description <span className="font-semibold text-[#a0a19b]">(optional)</span>
                </label>
                <textarea
                  id="habit-description"
                  rows={2}
                  maxLength={240}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What do you want to achieve?"
                  className="w-full resize-none rounded-xl border border-[#e4e2db] bg-white px-3.5 py-3 text-base text-black outline-none transition placeholder:text-[#b2b3ad] focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/10 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="habit-frequency" className="mb-1.5 block text-xs font-bold text-[#505149]">
                  Consistency schedule
                </label>
                <select
                  id="habit-frequency"
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value as HabitFrequency)}
                  className="h-12 w-full rounded-xl border border-[#e4e2db] bg-white px-3.5 text-base text-black outline-none transition focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/10 sm:text-sm"
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="custom">Selected days</option>
                  <option value="weekly">Times per week</option>
                </select>
              </div>

              {frequency === "custom" && (
                <div>
                  <p className="mb-2 text-xs font-bold text-[#505149]">Choose days</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAY_NAMES.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={selectedDays.includes(index)}
                        onClick={() => toggleDay(index)}
                        className={`h-11 rounded-xl border text-[11px] font-bold transition active:scale-95 ${focusRing} ${
                          selectedDays.includes(index)
                            ? "border-[#f16f3a] bg-[#fff0e9] text-[#e96330]"
                            : "border-[#e4e2db] bg-white text-[#888983] hover:border-[#cfcdc5]"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {frequency === "weekly" && (
                <div>
                  <label htmlFor="habit-target" className="mb-1.5 block text-xs font-bold text-[#505149]">
                    Target per week
                  </label>
                  <select
                    id="habit-target"
                    value={targetPerWeek}
                    onChange={(event) => setTargetPerWeek(Number(event.target.value))}
                    className="h-12 w-full rounded-xl border border-[#e4e2db] bg-white px-3.5 text-base text-black outline-none transition focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/10 sm:text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((target) => (
                      <option key={target} value={target}>
                        {target} {target === 1 ? "time" : "times"} a week
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold text-[#505149]">Icon</p>
                  <div className="flex gap-2">
                    {ICONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-label={`Choose ${item}`}
                        aria-pressed={icon === item}
                        onClick={() => setIcon(item)}
                        className={`grid size-11 place-items-center rounded-xl border transition active:scale-95 ${focusRing} ${
                          icon === item
                            ? "border-[#f16f3a] bg-[#fff0e9] text-[#f16f3a]"
                            : "border-[#e4e2db] bg-white text-[#888983] hover:border-[#cfcdc5]"
                        }`}
                      >
                        <Icon name={item} size={17} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-[#505149]">Colour</p>
                  <div className="flex gap-2.5">
                    {COLORS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-label={`Choose ${item}`}
                        aria-pressed={color === item}
                        onClick={() => setColor(item)}
                        className={`size-11 rounded-full transition active:scale-90 ${item} ${focusRing} ${
                          color === item ? "ring-2 ring-[#30312c] ring-offset-2 ring-offset-[#fbfaf7]" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className={`h-12 rounded-xl border border-[#e4e2db] bg-white px-5 text-xs font-bold text-[#77786f] transition hover:bg-[#f4f3ef] sm:h-11 ${focusRing}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createHabit.isPending}
                  className={`h-12 rounded-xl bg-[#f16f3a] px-6 text-xs font-bold text-white shadow-[0_6px_16px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.98] disabled:opacity-60 disabled:shadow-none sm:h-11 ${focusRing}`}
                >
                  {createHabit.isPending ? "Creating..." : "Create habit"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}