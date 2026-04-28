import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
      cardId: string;
    }>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const { projectId, cardId } = await params;
  const body = await req.json();

  const title = body.title?.trim();
  const assigneeId = body.assigneeId || null;
  const dueDate = body.dueDate ? new Date(body.dueDate) : null;

  if (!title) {
    return NextResponse.json(
      { message: "Mini task başlığı gerekli" },
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
      board: {
        include: {
          columns: {
            select: {
              id: true,
            },
          },
        },
      },
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!project || !project.board) {
    return NextResponse.json(
      { message: "Proje bulunamadı" },
      { status: 404 }
    );
  }

  const validColumnIds = project.board.columns.map((column) => column.id);

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      columnId: {
        in: validColumnIds,
      },
    },
  });

  if (!card) {
    return NextResponse.json(
      { message: "Kart bulunamadı" },
      { status: 404 }
    );
  }

  if (assigneeId) {
    const isProjectMember = project.members.some(
      (member) => member.userId === assigneeId
    );

    if (!isProjectMember) {
      return NextResponse.json(
        { message: "Atanan kullanıcı proje üyesi değil" },
        { status: 400 }
      );
    }
  }

  const subtask = await prisma.subtask.create({
    data: {
      title,
      cardId,
      assigneeId,
      dueDate,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(subtask, { status: 201 });
}