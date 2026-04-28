import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Geçerli email gir"),
  password: z.string().min(1, "Şifre gerekli"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Giriş işlemi başarısız" },
      { status: 400 }
    );
  }
}