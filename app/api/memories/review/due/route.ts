
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    const cards = await prisma.flashcard.findMany({
      where: {
        deck: { userId },
        OR: [
          { dueAt: null },
          { dueAt: { lte: now } },
        ],
      },
      include: {
        deck: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { dueAt: "asc" },
    });

    const result = cards.map(({ deck, ...card }) => ({
      card,
      deckId: deck.id,
      deckTitle: deck.title,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/memories/review/due:", error);

    return NextResponse.json(
      { error: "Failed to fetch cards due for review." },
      { status: 500 }
    );
  }
}
