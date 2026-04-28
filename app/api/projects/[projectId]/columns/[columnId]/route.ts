import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
      columnId: string;
    }>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const { projectId, columnId } = await params;

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

  if (project.ownerId !== user.userId) {
    return NextResponse.json(
      { message: "Sadece proje sahibi sütun silebilir" },
      { status: 403 }
    );
  }

  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      boardId: project.board.id,
    },
    include: {
      cards: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!column) {
    return NextResponse.json(
      { message: "Sütun bulunamadı" },
      { status: 404 }
    );
  }

  if (column.cards.length > 0) {
    return NextResponse.json(
      { message: "Bu sütunda kart olduğu için silinemez" },
      { status: 400 }
    );
  }

  await prisma.column.delete({
    where: {
      id: columnId,
    },
  });

  return NextResponse.json({
    message: "Sütun silindi",
  });
}