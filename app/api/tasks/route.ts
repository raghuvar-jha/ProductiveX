
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const validStatuses = ["todo", "inprogress", "completed"] as const;

type TaskStatus = (typeof validStatuses)[number];

async function getUserId(): Promise<number | null> {

    
    const session = await getSession();
    console.log(session)

  if (!session?.userId) return null;

  const userId = Number(session.userId);

  return Number.isSafeInteger(userId) && userId > 0
    ? userId
    : null;
}
export async function GET() {
  const startedAt = performance.now();

  try {
    const authStartedAt = performance.now();
    const session = await getSession();

    const authMs = performance.now() - authStartedAt;

    if (!session?.userId) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbStartedAt = performance.now();

    const tasks = await prisma.task.findMany({
      where: { userId: session.userId },
    });

    const dbMs = performance.now() - dbStartedAt;

    console.log({
      route: "/api/tasks",
      authMs: Math.round(authMs),
      dbMs: Math.round(dbMs),
      totalMs: Math.round(performance.now() - startedAt),
    });

    return Response.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks failed:", error);

    return Response.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    if (
      typeof input.title !== "string" ||
      !input.title.trim() ||
      input.title.trim().length > 200
    ) {
      return NextResponse.json(
        { error: "Title is required and must be at most 200 characters." },
        { status: 400 }
      );
    }

    if (
      input.description !== undefined &&
      input.description !== null &&
      typeof input.description !== "string"
    ) {
      return NextResponse.json(
        { error: "Description must be a string or null." },
        { status: 400 }
      );
    }

    const status = input.status ?? "todo";

    if (
      typeof status !== "string" ||
      !validStatuses.includes(status as TaskStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid task status." },
        { status: 400 }
      );
    }

    let dueDate: Date | null = null;

    if (input.dueDate !== undefined && input.dueDate !== null) {
      if (typeof input.dueDate !== "string") {
        return NextResponse.json(
          { error: "Invalid due date." },
          { status: 400 }
        );
      }

      dueDate = new Date(input.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date." },
          { status: 400 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title: input.title.trim(),
        description: input.description as string | null | undefined,
        status: status as TaskStatus,
        dueDate,
        userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks:", error);

    return NextResponse.json(
      { error: "Failed to create task." },
      { status: 500 }
    );
  }
}
