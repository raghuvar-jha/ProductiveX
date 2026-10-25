
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const frequencies = ["daily", "weekdays", "weekly", "custom"] as const;

type HabitFrequency = (typeof frequencies)[number];

async function getUserId(): Promise<number | null> {
  const session = await getSession();
  if (!session) return null;

  const userId = Number(session.userId);

  return Number.isSafeInteger(userId) && userId > 0
    ? userId
    : null;
}

function isScheduledDays(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(
      (day) => Number.isInteger(day) && day >= 0 && day <= 6
    ) &&
    new Set(value).size === value.length
  );
}

function isValidHabit(input: Record<string, unknown>): boolean {
  return (
    typeof input.name === "string" &&
    input.name.trim().length > 0 &&
    input.name.trim().length <= 120 &&
    (input.description === undefined ||
      (typeof input.description === "string" &&
        input.description.length <= 1000)) &&
    typeof input.frequency === "string" &&
    frequencies.includes(input.frequency as HabitFrequency) &&
    Number.isInteger(input.targetPerWeek) &&
    Number(input.targetPerWeek) >= 1 &&
    Number(input.targetPerWeek) <= 7 &&
    isScheduledDays(input.scheduledDays) &&
    typeof input.goal === "string" &&
    input.goal.length <= 500 &&
    typeof input.color === "string" &&
    input.color.length <= 50 &&
    typeof input.icon === "string" &&
    input.icon.length <= 100
  );
}

export async function GET() {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("GET /api/habits:", error);

    return NextResponse.json(
      { error: "Failed to fetch habits." },
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    if (!isValidHabit(input)) {
      return NextResponse.json(
        { error: "Invalid habit details." },
        { status: 400 }
      );
    }

    if (
        typeof input !== "object" ||
        input === null ||
        !("name" in input) ||
        typeof input.name !== "string" ||
        !input.name.trim() ||
        !("goal" in input) ||
        typeof input.goal !== "string" ||
        !input.goal.trim() ||
        !("color" in input) ||
        typeof input.color !== "string" ||
        !("icon" in input) ||
        typeof input.icon !== "string" ||
        !("scheduledDays" in input) ||
        !Array.isArray(input.scheduledDays) ||
        !input.scheduledDays.every(
          (day) => typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6
        )
      ) {
        return NextResponse.json(
          { error: "Invalid habit input." },
          { status: 400 }
        );
      }

    const habit = await prisma.habit.create({
      data: {
        name: input.name.trim(),
        description:
          typeof input.description === "string"
            ? input.description.trim()
            : null,
        frequency: input.frequency as HabitFrequency,
        targetPerWeek: Number(input.targetPerWeek),
        scheduledDays: input.scheduledDays,
        goal: input.goal.trim(),
        color: input.color,
        icon: input.icon,
        userId,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("POST /api/habits:", error);

    return NextResponse.json(
      { error: "Failed to create habit." },
      { status: 500 }
    );
  }
}
