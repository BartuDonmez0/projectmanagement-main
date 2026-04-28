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

  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { message: "Sütun adı gerekli" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: user.userId,
        },
      },
    },
    include: {
      board: true,
    },
  });

  if (!project || !project.board) {
    return NextResponse.json(
      { message: "Proje bulunamadı" },
      { status: 404 }
    );
  }

  const lastColumn = await prisma.column.findFirst({
    where: {
      boardId: project.board.id,
    },
    orderBy: {
      order: "desc",
    },
  });

  const column = await prisma.column.create({
    data: {
      title,
      boardId: project.board.id,
      order: lastColumn ? lastColumn.order + 1 : 0,
    },
  });

  return NextResponse.json(column, { status: 201 });
}