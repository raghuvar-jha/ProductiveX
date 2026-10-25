
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    if (!id || id.length > 100) {
      return NextResponse.json(
        { error: "Invalid focus session ID." },
        { status: 400 }
      );
    }

    const result = await prisma.focusSession.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Focus session not found." },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/focus/[id]:", error);

    return NextResponse.json(
      { error: "Failed to delete focus session." },
      { status: 500 }
    );
  }
}
