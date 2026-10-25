
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
    const deckId = Number(input.deckId);

    if (
      !Number.isSafeInteger(deckId) ||
      deckId <= 0 ||
      typeof input.front !== "string" ||
      !input.front.trim() ||
      typeof input.back !== "string" ||
      !input.back.trim()
    ) {
      return NextResponse.json(
        {
          error: "A valid deck, question, and answer are required.",
        },
        { status: 400 }
      );
    }

    const front = input.front.trim();
    const back = input.back.trim();

    if (front.length > 4000 || back.length > 4000) {
      return NextResponse.json(
        {
          error:
            "Question and answer must be at most 4000 characters each.",
        },
        { status: 400 }
      );
    }

    // Ensure the deck belongs to the authenticated user.
    const deck = await prisma.memoryDeck.findFirst({
      where: {
        id: deckId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: "Memory deck not found." },
        { status: 404 }
      );
    }

    const card = await prisma.flashcard.create({
      data: {
        front,
        back,
        deckId: deck.id,
        dueAt: new Date(),
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("POST /api/memories/cards:", error);

    return NextResponse.json(
      { error: "Failed to add flashcard." },
      { status: 500 }
    );
  }
}
