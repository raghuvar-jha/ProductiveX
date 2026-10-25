
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;

    if (!isValidDate(input.date)) {
      return NextResponse.json(
        { error: "A valid date in YYYY-MM-DD format is required." },
        { status: 400 }
      );
    }

    const habit = await prisma.$transaction(async (tx) => {
      const existing = await tx.habit.findFirst({
        where: { id, userId },
        select: { id: true, completions: true },
      });

      if (!existing) return null;

      const alreadyCompleted = existing.completions.includes(input.date as string);

      const completions = alreadyCompleted
        ? existing.completions.filter((date) => date !== input.date)
        : [...existing.completions, input.date as string];

      await tx.habit.updateMany({
        where: { id, userId },
        data: { completions },
      });

      return tx.habit.findFirst({
        where: { id, userId },
      });
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error("PATCH /api/habits/[id]/completion:", error);
    return NextResponse.json(
      { error: "Failed to update habit completion." },
      { status: 500 }
    );
  }
}
