
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const frequencies = ["daily", "weekdays", "weekly", "custom"] as const;

type HabitFrequency = (typeof frequencies)[number];

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

function validatePatch(input: Record<string, unknown>): boolean {
  const allowed = [
    "name",
    "description",
    "frequency",
    "targetPerWeek",
    "scheduledDays",
    "goal",
    "color",
    "icon",
  ];

  if (
    Object.keys(input).length === 0 ||
    Object.keys(input).some((key) => !allowed.includes(key))
  ) {
    return false;
  }

  if (
    "name" in input &&
    (typeof input.name !== "string" ||
      !input.name.trim() ||
      input.name.trim().length > 120)
  ) return false;

  if (
    "description" in input &&
    input.description !== null &&
    (typeof input.description !== "string" ||
      input.description.length > 1000)
  ) return false;

  if (
    "frequency" in input &&
    (typeof input.frequency !== "string" ||
      !frequencies.includes(input.frequency as HabitFrequency))
  ) return false;

  if (
    "targetPerWeek" in input &&
    (!Number.isInteger(input.targetPerWeek) ||
      Number(input.targetPerWeek) < 1 ||
      Number(input.targetPerWeek) > 7)
  ) return false;

  if (
    "scheduledDays" in input &&
    !isScheduledDays(input.scheduledDays)
  ) return false;

  if (
    "goal" in input &&
    (typeof input.goal !== "string" || input.goal.length > 500)
  ) return false;

  if (
    "color" in input &&
    (typeof input.color !== "string" || input.color.length > 50)
  ) return false;

  if (
    "icon" in input &&
    (typeof input.icon !== "string" || input.icon.length > 100)
  ) return false;

  return true;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error("GET /api/habits/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch habit." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getUserId();

    if (userId === null) {
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

    if (!validatePatch(input)) {
      return NextResponse.json({ error: "Invalid habit update." }, { status: 400 });
    }

    const data = {
      ...(typeof input.name === "string" ? { name: input.name.trim() } : {}),
      ...("description" in input
        ? {
            description:
              typeof input.description === "string"
                ? input.description.trim()
                : null,
          }
        : {}),
      ...(typeof input.frequency === "string"
        ? { frequency: input.frequency as HabitFrequency }
        : {}),
      ...(typeof input.targetPerWeek === "number"
        ? { targetPerWeek: input.targetPerWeek }
        : {}),
      ...(Array.isArray(input.scheduledDays)
        ? { scheduledDays: input.scheduledDays }
        : {}),
      ...(typeof input.goal === "string" ? { goal: input.goal.trim() } : {}),
      ...(typeof input.color === "string" ? { color: input.color } : {}),
      ...(typeof input.icon === "string" ? { icon: input.icon } : {}),
    };

    const result = await prisma.habit.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("PATCH /api/habits/[id]:", error);
    return NextResponse.json({ error: "Failed to update habit." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const userId = await getUserId();

    if (userId === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await prisma.habit.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/habits/[id]:", error);
    return NextResponse.json({ error: "Failed to delete habit." }, { status: 500 });
  }
}
