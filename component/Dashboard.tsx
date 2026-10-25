"use client";

import { useState, type FormEvent } from "react";
import { useCreateTask } from "@/features/tasks/queries";
import Icon from "./Icon";
import SectionTitle from "./SectionTitle";
import HabitList from "./HabitList";
import TaskList from "./TaskList";
import TimerCard from "./TimerCard";

import {
  useDailyReviewCards,
  useMemoryDecks,
  useMemoryStats,
} from "@/features/memories/queries";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const inputClass =
  "w-full rounded-xl border border-[#e4e2db] bg-white px-3.5 text-base text-[#30312c] outline-none transition placeholder:text-[#b2b3ad] focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/10 sm:text-sm";

const cardClass =
  "flex min-w-0 flex-col rounded-[24px] border border-[#e9e7e1] bg-white p-5 shadow-[0_8px_30px_rgba(40,40,35,0.04)] sm:rounded-[26px] sm:p-6";

// Long lists scroll inside their card so paired cards keep matching heights.
const scrollArea =
  "min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:#e1dfd7_transparent] [scrollbar-width:thin]";

export default function Dashboard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const dailyQuery = useDailyReviewCards();
  const decksQuery = useMemoryDecks();
  const statsQuery = useMemoryStats();

  const dailyCards = dailyQuery.data ?? [];
  const decks = decksQuery.data ?? [];
  const stats = statsQuery.data;

  const [answerVisible, setAnswerVisible] = useState(false);

  // Prefer a card that is due for review.
  // If none are due, show the first card from the user's library.
  const createTask = useCreateTask();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskFormError, setTaskFormError] = useState("");

  function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = taskTitle.trim();

    if (!title) {
      setTaskFormError("Please enter a task title.");
      return;
    }

    setTaskFormError("");

    createTask.mutate(
      {
        title,
        description: taskDescription.trim() || undefined,
        status: "todo",
        dueDate: taskDueDate || null,
      },
      {
        onSuccess: () => {
          setTaskTitle("");
          setTaskDescription("");
          setTaskDueDate("");
          setIsTaskFormOpen(false);
        },
        onError: (error) => {
          setTaskFormError(
            error instanceof Error
              ? error.message
              : "Failed to create task. Please try again."
          );
        },
      }
    );
  }

  const fallbackCard = decks.flatMap((deck) =>
    deck.cards.map((card) => ({
      card,
      deckId: deck.id,
      deckTitle: deck.title,
    }))
  )[0];

  const featuredMemory = dailyCards[0] ?? fallbackCard;

  const totalCards =
    stats?.totalCards ??
    decks.reduce((total, deck) => total + deck.cards.length, 0);

  const dueCards = stats?.dueCards ?? dailyCards.length;
  const streak = stats?.streak ?? 0;

  const memoriesLoading =
    dailyQuery.isLoading ||
    decksQuery.isLoading ||
    statsQuery.isLoading;

  /* ---------------------------- presentation only --------------------------- */

  const reviewedToday = stats?.reviewedToday ?? 0;

  const overview = [
    {
      label: "Cards due",
      value: memoriesLoading ? "–" : String(dueCards),
      icon: "cards" as const,
      tile: "border-[#e1dcf5] bg-[#f0edff]",
      iconBox: "text-[#7561bc]",
      label_c: "text-[#7a6fa8]",
    },
    {
      label: "Day streak",
      value: memoriesLoading ? "–" : String(streak),
      icon: "flame" as const,
      tile: "border-[#f3dccf] bg-[#fff0e9]",
      iconBox: "text-[#f16f3a]",
      label_c: "text-[#8f7366]",
    },
    {
      label: "Reviewed today",
      value: memoriesLoading ? "–" : String(reviewedToday),
      icon: "check" as const,
      tile: "border-[#d4eadd] bg-[#e9f5ef]",
      iconBox: "text-[#398260]",
      label_c: "text-[#5f8a74]",
    },
  ];

  return (
    <div
      className={
        compact ? "pb-5 pt-4" : "px-4 pb-6 pt-4 sm:px-8 sm:py-7"
      }
    >
      {!compact && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-2xl border border-[#e5e3dd] bg-white p-1 shadow-sm">
            <button
              className={`rounded-xl bg-[#242521] px-4 py-2 text-xs font-bold text-white shadow-[0_6px_14px_rgba(36,37,33,0.22)] ${focusRing}`}
            >
              Today
            </button>
          </div>

          <p className="hidden text-xs font-semibold text-[#a0a19b] sm:block">
            Your tasks, habits and focus at a glance
          </p>
        </div>
      )}

      {/* Overview */}
      <div
        className={`grid grid-cols-3 gap-2.5 sm:gap-4 ${
          compact ? "mt-4" : "mt-5 sm:mt-6"
        }`}
      >
        {overview.map((item) => (
          <div
            key={item.label}
            className={`relative flex flex-col justify-between overflow-hidden rounded-[20px] border p-3.5 shadow-[0_8px_24px_rgba(40,40,35,0.04)] sm:rounded-[24px] sm:p-5 ${item.tile}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-white/50 sm:size-24"
            />
            <span
              className={`grid size-8 place-items-center rounded-xl bg-white shadow-sm sm:size-9 ${item.iconBox}`}
            >
              <Icon name={item.icon} size={15} />
            </span>
            <div className="mt-4 sm:mt-5">
              <p className="text-[24px] font-extrabold leading-none tracking-[-1px] text-[#343530] sm:text-[30px]">
                {item.value}
              </p>
              <p
                className={`mt-1.5 text-[11px] font-semibold sm:text-xs ${item.label_c}`}
              >
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks and focus timer */}
      <div
        className={`mt-4 grid gap-4 sm:mt-5 sm:gap-5 ${
          compact
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]"
        }`}
      >
        <section className={cardClass}>
          <SectionTitle action="View all">
            Today’s tasks
          </SectionTitle>

          {/* Uses the existing task component and its data source. */}
          <div className={`mt-3 max-h-[340px] lg:max-h-[360px] ${scrollArea}`}>
            <TaskList />
          </div>

          {!compact && (
            <>
              <button
                type="button"
                onClick={() => {
                  setTaskFormError("");
                  setIsTaskFormOpen(true);
                }}
                className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#dcdad4] text-xs font-bold text-[#858680] transition hover:border-[#f16f3a]/60 hover:bg-[#fff6f1] hover:text-[#e96330] active:scale-[0.99] ${focusRing}`}
              >
                <Icon name="plus" size={14} />
                Add a new task
              </button>

              {isTaskFormOpen && (
                <div
                  className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#242521]/45 backdrop-blur-[3px] sm:items-center sm:p-4"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setIsTaskFormOpen(false);
                      setTaskFormError("");
                    }
                  }}
                >
                  <form
                    onSubmit={handleCreateTask}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-task-title"
                    className="max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-[#e7e5df] bg-[#fbfaf7] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_30px_80px_rgba(30,30,25,0.30)] sm:my-auto sm:rounded-[28px] sm:p-6"
                  >
                    <div
                      aria-hidden="true"
                      className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dedcd5] sm:hidden"
                    />

                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <h2
                          id="create-task-title"
                          className="text-xl font-extrabold tracking-[-0.4px] text-[#30312c]"
                        >
                          Create a task
                        </h2>
                        <p className="mt-1 text-xs text-[#92938d]">
                          Add the details for your task.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsTaskFormOpen(false)}
                        className={`h-10 shrink-0 rounded-xl px-3.5 text-xs font-bold text-[#77786f] transition hover:bg-[#efeee9] ${focusRing}`}
                      >
                        Cancel
                      </button>
                    </div>

                    <label
                      htmlFor="dash-task-title"
                      className="mb-1.5 block text-xs font-bold text-[#55564f]"
                    >
                      Task title *
                    </label>
                    <input
                      id="dash-task-title"
                      autoFocus
                      required
                      maxLength={200}
                      value={taskTitle}
                      onChange={(event) => setTaskTitle(event.target.value)}
                      placeholder="What do you need to do?"
                      className={`mb-4 h-12 ${inputClass}`}
                    />

                    <label
                      htmlFor="dash-task-description"
                      className="mb-1.5 block text-xs font-bold text-[#55564f]"
                    >
                      Description
                    </label>
                    <textarea
                      id="dash-task-description"
                      rows={3}
                      maxLength={2000}
                      value={taskDescription}
                      onChange={(event) =>
                        setTaskDescription(event.target.value)
                      }
                      placeholder="Add some details..."
                      className={`mb-4 resize-y py-3 ${inputClass}`}
                    />

                    <label
                      htmlFor="dash-task-due"
                      className="mb-1.5 block text-xs font-bold text-[#55564f]"
                    >
                      Due date
                    </label>
                    <input
                      id="dash-task-due"
                      type="date"
                      value={taskDueDate}
                      onChange={(event) => setTaskDueDate(event.target.value)}
                      className={`mb-4 h-12 min-w-0 ${inputClass}`}
                    />

                    {taskFormError && (
                      <p
                        role="alert"
                        className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600"
                      >
                        {taskFormError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={createTask.isPending || !taskTitle.trim()}
                      className={`h-12 w-full rounded-xl bg-[#f16f3a] px-4 text-sm font-bold text-white shadow-[0_6px_16px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${focusRing}`}
                    >
                      {createTask.isPending ? "Creating..." : "Create task"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </section>

        <TimerCard />
      </div>

      {/* Habits and memories */}
      <div
        className={`mt-4 grid gap-4 sm:mt-5 sm:gap-5 ${
          compact
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,1fr)]"
        }`}
      >
        <section className={cardClass}>
          <SectionTitle action="Manage habits">
            Habit tracker
          </SectionTitle>

          <div className={`mt-3 max-h-[380px] ${scrollArea}`}>
            <HabitList />
          </div>
        </section>

        {/* Live Memories data */}
        <section className={cardClass}>
          <SectionTitle action="Open library">
            Memory cards
          </SectionTitle>

          {memoriesLoading ? (
            <div
              className="mt-4 min-h-[170px] flex-1 animate-pulse rounded-2xl bg-[#f4f2ec] motion-reduce:animate-none"
              aria-busy="true"
              aria-label="Loading your memories"
            />
          ) : featuredMemory ? (
            <div className="flex flex-1 flex-col">
              <button
                type="button"
                onClick={() => setAnswerVisible((visible) => !visible)}
                className={`group relative mt-4 block min-h-[180px] w-full flex-1 rounded-2xl text-left ${focusRing}`}
                aria-label={
                  answerVisible
                    ? "Show flashcard question"
                    : "Reveal flashcard answer"
                }
              >
                <div className="absolute inset-x-4 bottom-0 top-3 rotate-2 rounded-2xl border border-[#dedbe9] bg-[#efecfa] transition-transform group-hover:rotate-3 motion-reduce:transition-none" />

                <div className="absolute inset-x-2 bottom-1 top-1 -rotate-1 rounded-2xl border border-[#e4e1d9] bg-[#faf7ed] transition-transform group-hover:-rotate-2 motion-reduce:transition-none" />

                <div className="absolute inset-0 flex items-center overflow-hidden rounded-2xl bg-[#8270c7] p-5 text-left text-white shadow-[0_14px_30px_rgba(130,112,199,0.35)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-white/10 blur-2xl"
                  />

                  <div className="relative min-w-0 flex-1">
                    <p className="line-clamp-1 text-[11px] font-bold text-white/70">
                      {featuredMemory.deckTitle}
                      {" · "}
                      {totalCards} {totalCards === 1 ? "card" : "cards"}
                    </p>

                    <p className="mt-2 line-clamp-3 text-[16px] font-extrabold leading-6 tracking-[-0.3px] sm:text-[17px]">
                      {answerVisible
                        ? featuredMemory.card.back
                        : featuredMemory.card.front}
                    </p>

                    <p className="mt-2 text-[11px] font-semibold text-white/70">
                      {answerVisible
                        ? "Tap to show the question"
                        : "Tap to reveal the answer"}
                    </p>
                  </div>

                  <span className="relative ml-3 grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#7865bd] shadow-sm">
                    <Icon
                      name="arrow"
                      size={16}
                    />
                  </span>
                </div>
              </button>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#373832]">
                    {dueCards} {dueCards === 1 ? "card" : "cards"} due today
                  </p>

                  <p className="mt-0.5 text-[11px] font-semibold text-[#a1a29b]">
                    {stats?.reviewedToday ?? 0} reviewed today
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff0e9] px-3 py-1.5 text-xs font-extrabold text-[#e96330]">
                  <Icon name="flame" size={13} />
                  {streak} {streak === 1 ? "day" : "days"}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedbd3] bg-[#faf9f6] px-4 py-9 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f0edff] text-[#7561bc]">
                <Icon name="cards" size={20} />
              </div>

              <p className="mt-4 text-sm font-extrabold text-[#373832]">
                Your memory library is empty
              </p>

              <p className="mx-auto mt-1 max-w-[30ch] text-xs leading-5 text-[#a1a29b]">
                Create a deck and add flashcards to see them here.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}