import { NextResponse } from "next/server";

import { getUserByEmail } from "@/services/auth.services";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request:Request){

    try{
    const {email,password} = await request.json();
    if(!email || !password) {
        return NextResponse.json(
            { message: "Enter Email and Password" },
            { status: 400 }
          );
    }



    const user = await  getUserByEmail(email)
   

    if(!user) {
        return NextResponse.json(
            { message: "Invalid email or password" },
            { status: 401 }
          );
    }

    const validUser = await bcrypt.compare(password,user?.passwordHash)
    if(!validUser)  {
        return NextResponse.json(
            { message: "Invalid email or password" },
            { status: 401 }
          );
    }

    const session = await createSession(user.id,user.name);
    console.log(session);
    return NextResponse.json(("User Logged In Saved To db!"))
    }catch(error){

        if (
            error instanceof Error &&
            error.message === "Enter Email or Password Correctly"
          ) {
            return NextResponse.json(
              { message: error.message },
              { status: 409 }
            );
          }

    }



}