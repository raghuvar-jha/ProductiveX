
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function getAuthenticatedUserId(): Promise<number | null> {
  const session = await getSession();

  if (!session) return null;

  const userId = Number(session.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (userId === null) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decks = await prisma.memoryDeck.findMany({
      where: { userId },
      include: {
        cards: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    const result = decks.map((deck) => ({
      ...deck,
      total: deck.cards.length,
      due: deck.cards.filter(
        (card) => !card.dueAt || card.dueAt <= now
      ).length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/memories/decks:", error);

    return NextResponse.json(
      { error: "Failed to fetch memory decks." },
      { status: 500 }
    );
  }
}

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
    const title =
      typeof input.title === "string" ? input.title.trim() : "";
    const description =
      typeof input.description === "string"
        ? input.description.trim()
        : "";
    const color =
      typeof input.color === "string" ? input.color : "#6366f1";
    const icon =
      typeof input.icon === "string" ? input.icon : "book-open";

    if (!title || title.length > 120) {
      return NextResponse.json(
        { error: "Deck title is required and must be at most 120 characters." },
        { status: 400 }
      );
    }

    if (
      description.length > 1000 ||
      color.length > 50 ||
      icon.length > 100
    ) {
      return NextResponse.json(
        { error: "One or more deck fields are too long." },
        { status: 400 }
      );
    }

    const deck = await prisma.memoryDeck.create({
      data: {
        title,
        description,
        color,
        icon,
        userId,
      },
      include: {
        cards: true,
      },
    });

    return NextResponse.json(
      { ...deck, total: 0, due: 0 },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/memories/decks:", error);

    return NextResponse.json(
      { error: "Failed to create memory deck." },
      { status: 500 }
    );
  }
}
