import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import "server-only";


export async function getUserByEmail(userId: string) {
  return prisma.user.findUnique({
    where: { email: userId },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash:true,
      createdAt: true,
    },
  });
}

export async function updateUserName(
    userId: number,
    name: string
  ) {
    const normalizedName = name.trim();
  
    if (!normalizedName) {
      throw new Error("Name cannot be empty");
    }
  
    return prisma.user.update({
      where: { id: userId },
      data: { name: normalizedName },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }


type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export async function signupUser(input: SignupInput) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;


  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }


  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }


  const passwordHash = await bcrypt.hash(password, 12);


  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });


  return user;
}