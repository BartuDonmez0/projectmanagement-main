import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli email gir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu email zaten kayıtlı" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json(
      { user },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0]?.message ?? "Bilgileri kontrol et.";
      return NextResponse.json({ message: first }, { status: 400 });
    }

    // Surface common Prisma errors in a user-friendly way.
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { message: "Bu email zaten kayıtlı" },
          { status: 400 }
        );
      }
    }

    console.error("Register error:", err);
    return NextResponse.json({ message: "Kayıt işlemi başarısız" }, { status: 400 });
  }
}