"use client";

import Icon from "./Icon";
import {
  useTasks,
  useUpdateTask,
  useDeleteTask,
} from "@/features/tasks/queries";
import type { Task, TaskStatus } from "@/features/tasks/types";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function TrashIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

export default function TaskList() {
  const tasksQuery = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = tasksQuery.data ?? [];

  function getTaskMeta(task: Task) {
    if (task.status === "completed") return "Completed";
    if (task.status === "inprogress") return "In progress";

    if (task.dueDate) {
      const date = new Date(task.dueDate);

      if (!Number.isNaN(date.getTime())) {
        return `Due ${date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}`;
      }
    }

    return task.description?.trim() || "To do";
  }

  function toggleTask(task: Task) {
    const nextStatus: TaskStatus =
      task.status === "completed" ? "todo" : "completed";

    updateTask.mutate({
      id: task.id,
      data: { status: nextStatus },
    });
  }

  function handleDeleteTask(taskId: number) {
    if (!window.confirm("Delete this task?")) return;

    deleteTask.mutate(taskId);
  }

  if (tasksQuery.isPending) {
    return (
      <div
        className="space-y-2.5 py-1"
        aria-busy="true"
        aria-label="Loading your tasks"
      >
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-2xl bg-[#f4f3ef] motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center">
        <p className="text-sm font-bold text-red-700">
          {tasksQuery.error instanceof Error
            ? tasksQuery.error.message
            : "Could not load your tasks."}
        </p>

        <button
          type="button"
          onClick={() => void tasksQuery.refetch()}
          className={`mt-3 h-10 rounded-xl bg-white px-5 text-xs font-bold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100 ${focusRing}`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dedcd5] bg-[#faf9f6] px-5 py-9 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#e9f5ef] text-[#398260]">
            <Icon name="check" size={20} />
          </div>
          <p className="mt-3 text-sm font-extrabold text-[#373832]">
            No tasks yet
          </p>
          <p className="mx-auto mt-1 max-w-[30ch] text-xs leading-5 text-[#a0a19b]">
            Add a task to get started.
          </p>
        </div>
      ) : (
        tasks.map((task) => {
          const completed = task.status === "completed";
          const inProgress = task.status === "inprogress";

          return (
            <div
              key={task.id}
              className="group flex min-h-[68px] items-center gap-1 rounded-2xl px-1 transition-colors hover:bg-[#faf9f6] sm:gap-2 sm:px-2"
            >
              {/* 44px tap target around the visual checkbox */}
              <button
                type="button"
                onClick={() => toggleTask(task)}
                disabled={updateTask.isPending}
                aria-label={
                  completed
                    ? `Reopen ${task.title}`
                    : `Complete ${task.title}`
                }
                className={`grid size-11 shrink-0 place-items-center rounded-xl disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-lg border-2 transition ${
                    completed
                      ? "border-[#4ba67b] bg-[#4ba67b] text-white"
                      : "border-[#d9d8d2] bg-white group-hover:border-[#4ba67b]"
                  }`}
                >
                  {completed && <Icon name="check" size={13} />}
                </span>
              </button>

              <div className="min-w-0 flex-1 pl-1">
                <p
                  className={`truncate text-sm font-bold ${
                    completed
                      ? "text-[#a3a49e] line-through"
                      : "text-[#343531]"
                  }`}
                >
                  {task.title}
                </p>

                <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-[#a0a19b]">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 shrink-0 rounded-full ${
                      completed
                        ? "bg-[#4ba67b]"
                        : inProgress
                          ? "bg-[#8270c7]"
                          : "bg-[#f16f3a]"
                    }`}
                  />
                  <span className="truncate">{getTaskMeta(task)}</span>
                </p>
              </div>

              {inProgress && (
                <span className="hidden shrink-0 rounded-full bg-[#f0edff] px-3 py-1 text-[11px] font-bold text-[#7661ba] min-[420px]:inline-block">
                  In progress
                </span>
              )}

              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                disabled={deleteTask.isPending}
                aria-label={`Delete ${task.title}`}
                title="Delete task"
                className={`grid size-11 shrink-0 place-items-center rounded-xl text-[#b4b5af] transition hover:bg-[#fdecea] hover:text-[#c05d51] disabled:cursor-not-allowed disabled:opacity-40 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100 ${focusRing}`}
              >
                <TrashIcon />
              </button>
            </div>
          );
        })
      )}

      {(updateTask.isError || deleteTask.isError) && (
        <p
          role="alert"
          className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600"
        >
          {updateTask.error instanceof Error
            ? updateTask.error.message
            : deleteTask.error instanceof Error
              ? deleteTask.error.message
              : "Could not update your tasks. Please try again."}
        </p>
      )}
    </div>
  );
}