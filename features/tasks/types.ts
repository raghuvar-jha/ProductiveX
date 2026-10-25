export type TaskStatus =
  | "todo"
  | "inprogress"
  | "completed";

export type Task = {

  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
};

export type TaskColumn = {
    title: string;
    status: TaskStatus;
    dot: string;
    items: Task[];
  };