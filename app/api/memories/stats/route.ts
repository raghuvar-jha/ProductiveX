
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";




function getUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Use UTC consistently for today's statistics.
    const startOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    const [
      reviewedToday,
      rememberedToday,
      againToday,
      totalCards,
      dueCards,
      reviewHistory,
    ] = await Promise.all([
      prisma.memoryReviewLog.count({
        where: {
          userId,
          reviewedAt: { gte: startOfDay },
        },
      }),

      prisma.memoryReviewLog.count({
        where: {
          userId,
          reviewedAt: { gte: startOfDay },
          rating: { in: ["good", "easy"] },
        },
      }),

      prisma.memoryReviewLog.count({
        where: {
          userId,
          reviewedAt: { gte: startOfDay },
          rating: "again",
        },
      }),

      prisma.flashcard.count({
        where: {
          deck: { userId },
        },
      }),

      prisma.flashcard.count({
        where: {
          deck: { userId },
          OR: [
            { dueAt: null },
            { dueAt: { lte: now } },
          ],
        },
      }),

      prisma.memoryReviewLog.findMany({
        where: { userId },
        select: { reviewedAt: true },
        orderBy: { reviewedAt: "desc" },
      }),
    ]);

    // Count consecutive days with at least one review.
    const reviewedDays = new Set(
      reviewHistory.map(({ reviewedAt }) =>
        getUtcDayKey(reviewedAt)
      )
    );

    const todayKey = getUtcDayKey(now);
    const yesterday = new Date(startOfDay);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    let currentDay = reviewedDays.has(todayKey)
      ? new Date(startOfDay)
      : reviewedDays.has(getUtcDayKey(yesterday))
        ? yesterday
        : null;

    let streak = 0;

    while (
      currentDay &&
      reviewedDays.has(getUtcDayKey(currentDay))
    ) {
      streak++;

      currentDay.setUTCDate(
        currentDay.getUTCDate() - 1
      );
    }

    return NextResponse.json({
      reviewedToday,
      rememberedToday,
      againToday,
      totalCards,
      dueCards,
      streak,
    });
  } catch (error) {
    console.error("GET /api/memories/stats:", error);

    return NextResponse.json(
      { error: "Failed to fetch memory statistics." },
      { status: 500 }
    );
  }
}
