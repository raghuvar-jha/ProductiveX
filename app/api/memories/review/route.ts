
import { connection, NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";



const validRatings = ["again", "hard", "good", "easy"] as const;


type Rating = (typeof validRatings)[number];

export async function POST(request: NextRequest) {

  
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
    const cardId = Number(input.cardId);

    if (
      !Number.isSafeInteger(cardId) ||
      cardId <= 0 ||
      typeof input.rating !== "string" ||
      !validRatings.includes(input.rating as Rating)
    ) {
      return NextResponse.json(
        { error: "A valid card ID and review rating are required." },
        { status: 400 }
      );
    }

    const rating = input.rating as Rating;

    if (
      input.deckId !== undefined &&
      input.deckId !== null &&
      (!Number.isSafeInteger(Number(input.deckId)) ||
        Number(input.deckId) <= 0)
    ) {
      return NextResponse.json(
        { error: "Invalid deck ID." },
        { status: 400 }
      );
    }

    await prisma.$transaction(
        async (tx) => {
      const card = await tx.flashcard.findFirst({
        where: {
          id: cardId,
          deck: { userId },
        },
        select: {
          id: true,
          deckId: true,
          intervalDays: true,
          repetitions: true,
        },
      });

      if (!card) {
        throw new Error("FLASHCARD_NOT_FOUND");
      }

      if (
        input.deckId !== undefined &&
        input.deckId !== null &&
        Number(input.deckId) !== card.deckId
      ) {
        throw new Error("DECK_MISMATCH");
      }

      let intervalDays = card.intervalDays;
      let repetitions = card.repetitions;

      switch (rating) {
        case "again":
          intervalDays = 0;
          repetitions = 0;
          break;

        case "hard":
          intervalDays = Math.max(1, intervalDays);
          repetitions += 1;
          break;

        case "good":
          intervalDays = Math.max(
            1,
            intervalDays === 0 ? 1 : intervalDays * 2
          );
          repetitions += 1;
          break;

        case "easy":
          intervalDays = Math.max(
            4,
            intervalDays === 0 ? 4 : Math.ceil(intervalDays * 3)
          );
          repetitions += 1;
          break;
      }

      const now = new Date();
      const dueAt = new Date(now);

      if (intervalDays > 0) {
        dueAt.setDate(dueAt.getDate() + intervalDays);
      }

      await tx.flashcard.update({
        where: { id: card.id },
        data: {
          intervalDays,
          repetitions,
          lastReviewedAt: now,
          dueAt,
        },
      });

      await tx.memoryReviewLog.create({
        data: {
          userId,
          cardId: card.id,
          deckId: card.deckId,
          rating,
        },
      });
    },
    {
      maxWait: 10000,
      timeout: 15000,
    }
  );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "FLASHCARD_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: "Flashcard not found." },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "DECK_MISMATCH"
    ) {
      return NextResponse.json(
        { error: "The card does not belong to the selected deck." },
        { status: 400 }
      );
    }

    console.error("POST /api/memories/review:", error);

    return NextResponse.json(
      { error: "Failed to save flashcard review." },
      { status: 500 }
    );
  }
}
