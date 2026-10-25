
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const validModes = [
  "pomodoro",
  "shortBreak",
  "longBreak",
] as const;

type FocusMode = (typeof validModes)[number];

async function getAuthenticatedUserId(): Promise<number | null> {
  const session = await getSession();

  if (!session) return null;

  const userId = Number(session.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

// GET /api/focus
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessions = await prisma.focusSession.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("GET /api/focus:", error);

    return NextResponse.json(
      { error: "Failed to fetch focus sessions." },
      { status: 500 }
    );
  }
}

// POST /api/focus
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

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
      typeof input.mode !== "string" ||
      !validModes.includes(input.mode as FocusMode)
    ) {
      return NextResponse.json(
        { error: "A valid focus mode is required." },
        { status: 400 }
      );
    }

    const durationSeconds = input.durationSeconds;

    if (
      typeof durationSeconds !== "number" ||
      !Number.isSafeInteger(durationSeconds) ||
      durationSeconds <= 0 ||
      durationSeconds > 86400
    ) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 86400 seconds." },
        { status: 400 }
      );
    }

    // The user ID and completion timestamp are set server-side.
    const session = await prisma.focusSession.create({
      data: {
        mode: input.mode as FocusMode,
        durationSeconds,
        userId,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("POST /api/focus:", error);

    return NextResponse.json(
      { error: "Failed to save focus session." },
      { status: 500 }
    );
  }
}

// DELETE /api/focus
export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.focusSession.deleteMany({
      where: { userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/focus:", error);

    return NextResponse.json(
      { error: "Failed to clear focus sessions." },
      { status: 500 }
    );
  }
}
