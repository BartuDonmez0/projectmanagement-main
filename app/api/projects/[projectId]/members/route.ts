import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await req.json();
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json(
      { message: "Email gerekli" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json(
      { message: "Proje bulunamadı" },
      { status: 404 }
    );
  }

  if (project.ownerId !== user.userId) {
    return NextResponse.json(
      { message: "Bu işlem için yetkin yok" },
      { status: 403 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!targetUser) {
    return NextResponse.json(
      { message: "Bu email ile kayıtlı kullanıcı bulunamadı" },
      { status: 404 }
    );
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: targetUser.id,
        projectId,
      },
    },
  });

  if (existingMember) {
    return NextResponse.json(
      { message: "Bu kullanıcı zaten projede" },
      { status: 400 }
    );
  }

  const member = await prisma.projectMember.create({
    data: {
      userId: targetUser.id,
      projectId,
      role: "MEMBER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(member, { status: 201 });
}