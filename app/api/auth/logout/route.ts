import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Replace "session" with the exact cookie name used in createSession()
    cookieStore.delete("session");

    return NextResponse.json(
      { message: "User logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { message: "Failed to log out" },
      { status: 500 }
    );
  }
}