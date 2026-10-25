"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import Icon from "./Icon";
import PageHeading from "./PageHeading";

import type { Task, TaskStatus } from "@/features/tasks/types";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/features/tasks/queries";

type TasksPageProps = {
  compact: boolean;
};
type FilterType =
  | "All tasks"
  | "Today"
  | "Tomorrow"
  | "Upcoming"
  | "Completed";

const filters: FilterType[] = [
  "All tasks",
  "Today",
  "Tomorrow",
  "Upcoming",
  "Completed",
];

const columnDefinitions: {
  title: string;
  status: TaskStatus;
  dot: string;
}[] = [
  {
    title: "To do",
    status: "todo",
    dot: "bg-[#f16f3a]",
  },
  {
    title: "In progress",
    status: "inprogress",
    dot: "bg-[#8270c7]",
  },
  {
    title: "Completed",
    status: "completed",
    dot: "bg-[#4ba67b]",
  },
];

function formatDueDate(value?: string | null) {
  if (!value) return "No due date";

  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return `Due ${value}`;
  }

  return `Due ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/* -------------------------------------------------------------------------- */
/*  Presentational pieces (no logic)                                          */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]";

const inputClass =
  "w-full rounded-xl border border-[#e4e2db] bg-white px-3.5 text-base text-[#30312c] outline-none transition placeholder:text-[#b2b3ad] focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/10 sm:text-sm";

function svg(path: ReactNode, size = 15) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const PencilIcon = () =>
  svg(
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </>
  );

const TrashIcon = () =>
  svg(
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </>
  );

const CalendarIcon = () =>
  svg(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>,
    13
  );

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function TasksPage({ compact }: TasksPageProps) {

  const [loading,setLoading] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [tomorrow, setTomorrow] = useState<string | null>(null);

useEffect(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  startTransition(() => {
    setToday(getLocalDateString(new Date()));
    setTomorrow(getLocalDateString(tomorrow))

  });
  setLoading(true)
}, []);


function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

  const tasksQuery = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = tasksQuery.data ?? [];

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All tasks");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");

  const [formError, setFormError] = useState("");

  const isSaving = createTask.isPending || updateTask.isPending;

  const filteredTasks = useMemo(() => {

    if(today==null) return [] 

    switch (activeFilter) {
      case "Today":
        return tasks.filter(
          (task) => task.dueDate?.slice(0, 10) === today
        );
  
      case "Tomorrow":
        return tasks.filter(
          (task) => task.dueDate?.slice(0, 10) === tomorrow
        );
  
      case "Upcoming":
        return tasks.filter((task) => {
          const date = task.dueDate?.slice(0, 10);
  
          return (
            Boolean(date) && date! > today && task.status !== "completed"
          );
        });
  
      case "Completed":
        return tasks.filter(
          (task) => task.status === "completed"
        );
  
      default:
        return tasks;
    }
  }, [tasks, activeFilter, today, tomorrow]);
  
  const columns = useMemo(
    () =>
      columnDefinitions.map((column) => ({
        ...column,
        items: filteredTasks.filter(
          (task) => task.status === column.status
        ),
      })),
    [filteredTasks]
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setDueDate("");
    setEditingTask(null);
    setFormError("");
    setIsFormOpen(false);
  }

  function openCreateForm(defaultStatus: TaskStatus = "todo") {
    setTitle("");
    setDescription("");
    setStatus(defaultStatus);
    setDueDate("");
    setEditingTask(null);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(task: Task) {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setDueDate(task.dueDate?.slice(0, 10) ?? "");
    setEditingTask(task);
    setFormError("");
    setIsFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Please enter a task title.");
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: description.trim() || undefined,
      status,
      dueDate: dueDate || null,
    };

    if (editingTask) {
      updateTask.mutate(
        {
          id: editingTask.id,
          data: payload,
        },
        {
          onSuccess: () => resetForm(),
          onError: (error) => {
            setFormError(getErrorMessage(error));
          },
        }
      );

      return;
    }

    createTask.mutate(payload, {
      onSuccess: () => resetForm(),
      onError: (error) => {
        setFormError(getErrorMessage(error));
      },
    });
  }

  function handleToggleComplete(task: Task) {
    const nextStatus: TaskStatus =
      task.status === "completed" ? "todo" : "completed";

    updateTask.mutate({
      id: task.id,
      data: { status: nextStatus },
    });
  }

  function handleDelete(task: Task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      deleteTask.mutate(task.id);
    }
  }

  const mutationError =
    createTask.error ??
    updateTask.error ??
    deleteTask.error;

  /* ---------------------------- presentation only --------------------------- */

  const doneCount = tasks.filter((task) => task.status === "completed").length;
  const progressPct =
    tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  const pagePadding = compact
    ? "px-4 pb-6 pt-4"
    : "px-4 pb-6 pt-4 sm:px-8 sm:py-7";
  const columnsGrid = compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3";

  return (
    <div className={`w-full ${pagePadding}`}>
      <PageHeading page="tasks" compact={compact} />

      {/* Progress overview */}
      {!tasksQuery.isPending && !tasksQuery.isError && tasks.length > 0 && (
        <div className="mt-5 flex items-center gap-4 rounded-[22px] border border-[#e7e5df] bg-white p-4 shadow-[0_8px_30px_rgba(40,40,35,0.04)] sm:mt-6 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-extrabold text-[#30312c]">
                {doneCount} of {tasks.length} done
              </p>
              <p className="text-xs font-bold text-[#4ba67b]">{progressPct}%</p>
            </div>
            <div
              className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#eceae5]"
              role="progressbar"
              aria-label="Tasks completed"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#4ba67b] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters and create action */}
      <div className="mt-5 flex items-center gap-3 sm:mt-6">
        <div
          className="-mx-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter tasks"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`h-11 shrink-0 whitespace-nowrap rounded-xl px-4 text-xs font-extrabold transition active:scale-[0.97] ${focusRing} ${
                activeFilter === filter
                  ? "bg-[#242521] text-white shadow-[0_6px_14px_rgba(36,37,33,0.22)]"
                  : "border border-[#e7e5df] bg-white text-[#77786f] hover:bg-[#efeee9]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {!compact && (
          <button
            type="button"
            onClick={() => openCreateForm()}
            aria-label="New task"
            className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f16f3a] px-3.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.97] sm:px-4 ${focusRing}`}
          >
            <Icon name="plus" size={14} />
            <span className="hidden sm:inline">New task</span>
          </button>
        )}
      </div>

      {/* Loading and errors */}
      {tasksQuery.isPending && (
        <div
          className={`mt-5 grid gap-4 ${columnsGrid}`}
          aria-busy="true"
          aria-label="Loading your tasks"
        >
          {(compact ? [0] : [0, 1, 2]).map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-[24px] bg-[#f1f0eb] motion-reduce:animate-none"
            />
          ))}
        </div>
      )}

      {tasksQuery.isError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load tasks: {getErrorMessage(tasksQuery.error)}
          <button
            type="button"
            onClick={() => tasksQuery.refetch()}
            className={`ml-3 rounded font-bold underline ${focusRing}`}
          >
            Retry
          </button>
        </div>
      )}

      {mutationError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700"
        >
          {getErrorMessage(mutationError)}
        </p>
      )}

      {/* Task columns */}
      {!tasksQuery.isPending && !tasksQuery.isError && (
        <div className={`mt-5 grid gap-4 ${columnsGrid}`}>
          {columns.map((column) => (
            <section
              key={column.status}
              aria-label={column.title}
              className="rounded-[24px] border border-[#e7e5df] bg-[#f7f6f2] p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span
                  className={`size-2.5 rounded-full ${column.dot}`}
                  aria-hidden="true"
                />

                <p className="text-sm font-extrabold text-[#3d3e39]">
                  {column.title}
                </p>

                <span className="grid h-6 min-w-6 place-items-center rounded-lg bg-white px-1.5 text-[11px] font-bold text-[#9a9b95] shadow-sm">
                  {column.items.length}
                </span>

                <button
                  type="button"
                  onClick={() => openCreateForm(column.status)}
                  aria-label={`Add task to ${column.title}`}
                  className={`ml-auto grid size-9 place-items-center rounded-xl text-[#85867f] transition hover:bg-white hover:text-[#242521] hover:shadow-sm ${focusRing}`}
                >
                  <Icon name="plus" size={15} />
                </button>
              </div>

              <div className="space-y-2.5">
                {column.items
                  .slice(0, compact ? 2 : undefined)
                  .map((task) => {
                    const completed = task.status === "completed";
                    const dueKey = task.dueDate?.slice(0, 10);
                    const overdue =
                      !completed &&
                      Boolean(dueKey) &&
                      today !== null &&
                      dueKey! < today;

                    return (
                      <article
                        key={task.id}
                        className="rounded-2xl border border-[#e7e5df] bg-white p-3.5 shadow-[0_3px_10px_rgba(40,40,35,0.03)] transition hover:shadow-[0_10px_24px_rgba(40,40,35,0.07)] motion-reduce:transition-none"
                      >
                        <div className="flex items-start gap-1">
                          {/* 44px tap target around the visual checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(task)}
                            aria-label={
                              completed
                                ? `Reopen ${task.title}`
                                : `Complete ${task.title}`
                            }
                            title={
                              completed
                                ? "Reopen task"
                                : "Mark as completed"
                            }
                            className={`-ml-1.5 -mt-1.5 grid size-11 shrink-0 place-items-center rounded-xl ${focusRing}`}
                          >
                            <span
                              className={`grid size-[22px] place-items-center rounded-lg border-2 transition ${
                                completed
                                  ? "border-[#4ba67b] bg-[#4ba67b] text-white"
                                  : "border-[#d8d7d1] bg-white hover:border-[#4ba67b]"
                              }`}
                            >
                              {completed && <Icon name="check" size={12} />}
                            </span>
                          </button>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <p
                              className={`break-words text-sm font-extrabold leading-5 ${
                                completed
                                  ? "text-[#9b9c96] line-through"
                                  : "text-[#3b3c37]"
                              }`}
                            >
                              {task.title}
                            </p>

                            {task.description && (
                              <p className="mt-1.5 line-clamp-2 break-words text-xs font-medium leading-5 text-[#8e8f89]">
                                {task.description}
                              </p>
                            )}

                            {task.dueDate ? (
                              <p
                                className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                  overdue
                                    ? "bg-[#fdecea] text-[#c05d51]"
                                    : "bg-[#f4f3ef] text-[#85867f]"
                                }`}
                              >
                                <CalendarIcon />
                                {formatDueDate(task.dueDate)}
                              </p>
                            ) : (
                              !task.description && (
                                <p className="mt-1.5 text-xs font-medium text-[#a6a7a1]">
                                  No additional details
                                </p>
                              )
                            )}

                            <div className="mt-3 flex items-center gap-1 border-t border-[#f0eee9] pt-2.5">
                              <button
                                type="button"
                                onClick={() => openEditForm(task)}
                                className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-[#77786f] transition hover:bg-[#f4f3ef] hover:text-[#242521] ${focusRing}`}
                              >
                                <PencilIcon />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(task)}
                                disabled={deleteTask.isPending}
                                className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-[#c05d51] transition hover:bg-[#fdecea] hover:text-red-700 disabled:opacity-50 ${focusRing}`}
                              >
                                <TrashIcon />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                {column.items.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-[#dedcd5] px-3 py-7 text-center text-xs font-medium text-[#a1a29c]">
                    No tasks here
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => openCreateForm(column.status)}
                className={`mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d9d7d0] text-xs font-bold text-[#92938d] transition hover:border-[#f16f3a]/60 hover:bg-white hover:text-[#e96330] ${focusRing}`}
              >
                <Icon name="plus" size={13} />
                Add task
              </button>
            </section>
          ))}
        </div>
      )}

      {/* Add / edit task modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#242521]/45 backdrop-blur-[3px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              resetForm();
            }
          }}
        >
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-[#e7e5df] bg-[#fbfaf7] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_30px_80px_rgba(30,30,25,0.30)] sm:my-auto sm:rounded-[28px] sm:p-6"
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dedcd5] sm:hidden"
            />

            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="task-form-title"
                  className="text-xl font-extrabold tracking-[-0.4px] text-[#30312c]"
                >
                  {editingTask ? "Edit task" : "Create a task"}
                </h2>
                <p className="mt-1 text-xs text-[#92938d]">
                  Add the details for your task.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className={`h-10 shrink-0 rounded-xl px-3.5 text-xs font-bold text-[#77786f] transition hover:bg-[#efeee9] ${focusRing}`}
              >
                Cancel
              </button>
            </div>

            <label
              htmlFor="task-title"
              className="mb-1.5 block text-xs font-bold text-[#55564f]"
            >
              Task title *
            </label>
            <input
              id="task-title"
              autoFocus
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you need to do?"
              className={`mb-4 h-12 ${inputClass}`}
            />

            <label
              htmlFor="task-description"
              className="mb-1.5 block text-xs font-bold text-[#55564f]"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Add some details..."
              className={`mb-4 resize-y py-3 ${inputClass}`}
            />

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-status"
                  className="mb-1.5 block text-xs font-bold text-[#55564f]"
                >
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TaskStatus)
                  }
                  className={`h-12 ${inputClass}`}
                >
                  <option value="todo">To do</option>
                  <option value="inprogress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-due"
                  className="mb-1.5 block text-xs font-bold text-[#55564f]"
                >
                  Due date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  className={`h-12 min-w-0 ${inputClass}`}
                />
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className={`h-12 w-full rounded-xl bg-[#f16f3a] px-4 text-sm font-bold text-white shadow-[0_6px_16px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${focusRing}`}
            >
              {isSaving
                ? "Saving..."
                : editingTask
                  ? "Save changes"
                  : "Create task"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}