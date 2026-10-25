
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";

const secret = new TextEncoder().encode(process.env.SECRET);

async function createToken(userId: number) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function createSession(userId: number, name: string) {
  const token = await createToken(userId);
  const cookieStore = await cookies();

  cookieStore.set("username", name, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (typeof payload.userId !== "number") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {

  try {

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

  return verifyToken(token);
} catch (error: any) {
  
  if (error?.digest === 'HANGING_PROMISE_REJECTION' || error?.message?.includes('prerendering')) {
    return null;
  }
  

  throw error;
}

}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
  cookieStore.delete("username");
}
