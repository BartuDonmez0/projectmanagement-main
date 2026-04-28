import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, signToken } from "@/lib/auth";


export async function GET() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: authUser.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      projects: {
        include: {
          project: {
            include: {
              members: true,
              board: {
                include: {
                  columns: {
                    include: {
                      cards: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      ownedProjects: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Kullanıcı bulunamadı" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();

  const name = body.name?.trim();
  const email = body.email?.trim();
  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;

  const user = await prisma.user.findUnique({
    where: {
      id: authUser.userId,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Kullanıcı bulunamadı" },
      { status: 404 }
    );
  }

  const updateData: {
    name?: string;
    email?: string;
    password?: string;
  } = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu email zaten kullanılıyor" },
        { status: 400 }
      );
    }

    updateData.email = email;
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { message: "Mevcut şifre gerekli" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Mevcut şifre hatalı" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Yeni şifre en az 6 karakter olmalı" },
        { status: 400 }
      );
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const response = NextResponse.json({
    user: updatedUser,
  });

  const token = signToken({
    userId: updatedUser.id,
    email: updatedUser.email,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}