import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      username: "Guest",
      login: false,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.userId),
    },
    select: {
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({
      username: "Guest",
      login: false,
    });
  }

  return NextResponse.json({
    username: user.name,
    login: true,
  });
}