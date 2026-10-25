
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const validStatuses = ["todo", "inprogress", "completed"] as const;

type TaskStatus = (typeof validStatuses)[number];

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getUserId(): Promise<number | null> {
  const session = await getSession();
    console.log(session)
  if (!session?.userId) return null;

  const userId = Number(session.userId);

  return Number.isSafeInteger(userId) && userId > 0
    ? userId
    : null;
}

async function getTaskId(
  params: RouteContext["params"]
): Promise<number | null> {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) return null;

  const taskId = Number(id);

  return Number.isSafeInteger(taskId) ? taskId : null;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = await getTaskId(params);

    if (id === null) {
      return NextResponse.json(
        { error: "Invalid task ID." },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id]:", error);

    return NextResponse.json(
      { error: "Failed to fetch task." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = await getTaskId(params);

    if (id === null) {
      return NextResponse.json(
        { error: "Invalid task ID." },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      dueDate?: Date | null;
    } = {};

    if (Object.hasOwn(input, "title")) {
      if (
        typeof input.title !== "string" ||
        !input.title.trim() ||
        input.title.trim().length > 200
      ) {
        return NextResponse.json(
          { error: "Invalid task title." },
          { status: 400 }
        );
      }

      data.title = input.title.trim();
    }

    if (Object.hasOwn(input, "description")) {
      if (
        input.description !== null &&
        typeof input.description !== "string"
      ) {
        return NextResponse.json(
          { error: "Description must be a string or null." },
          { status: 400 }
        );
      }

      data.description = input.description as string | null;
    }

    if (Object.hasOwn(input, "status")) {
      if (
        typeof input.status !== "string" ||
        !validStatuses.includes(input.status as TaskStatus)
      ) {
        return NextResponse.json(
          { error: "Invalid task status." },
          { status: 400 }
        );
      }

      data.status = input.status as TaskStatus;
    }

    if (Object.hasOwn(input, "dueDate")) {
      if (input.dueDate === null) {
        data.dueDate = null;
      } else if (typeof input.dueDate === "string") {
        const date = new Date(input.dueDate);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "Invalid due date." },
            { status: 400 }
          );
        }

        data.dueDate = date;
      } else {
        return NextResponse.json(
          { error: "Invalid due date." },
          { status: 400 }
        );
      }
    }

    if (Object.keys(input).some(
      (key) => !["title", "description", "status", "dueDate"].includes(key)
    )) {
      return NextResponse.json(
        { error: "Unsupported task field." },
        { status: 400 }
      );
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Provide at least one field to update." },
        { status: 400 }
      );
    }

    const result = await prisma.task.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id]:", error);

    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = await getTaskId(params);

    if (id === null) {
      return NextResponse.json(
        { error: "Invalid task ID." },
        { status: 400 }
      );
    }

    const result = await prisma.task.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/tasks/[id]:", error);

    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
