
import { NextResponse } from "next/server";
import { signupUser } from "@/services/auth.services";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const user = await signupUser({
      name,
      email,
      password,
    });


    return NextResponse.json(
      {
        message: "Signup successful",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
   
    if (
      error instanceof Error &&
      error.message === "Email is already registered"
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }

    console.error("Signup error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
