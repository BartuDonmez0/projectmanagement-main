import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
      cardId: string;
      subtaskId: string;
    }>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }


  const { projectId, cardId, subtaskId } = await params;
  const body = await req.json();

  const isCompleted = Boolean(body.isCompleted);

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
      board: {
        include: {
          columns: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!project || !project.board) {
    return NextResponse.json({ message: "Proje bulunamadı" }, { status: 404 });
  }

  const columnIds = project.board.columns.map((column) => column.id);

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      columnId: {
        in: columnIds,
      },
    },
  });

  if (!card) {
    return NextResponse.json({ message: "Kart bulunamadı" }, { status: 404 });
  }

  const subtask2 = await prisma.subtask.findUnique({
  where: { id: subtaskId },
});

if (!subtask2) {
  return NextResponse.json({ message: "Subtask bulunamadı" }, { status: 404 });
}

if (subtask2.assigneeId !== user.userId) {
  return NextResponse.json(
    { message: "Bu işlemi yapamazsın" },
    { status: 403 }
  );
}

  const updated = await prisma.subtask.update({
  where: { id: subtaskId },
  data: { isCompleted },
});

  return NextResponse.json(updated);
}