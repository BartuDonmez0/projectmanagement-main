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

  const dueDate = body.dueDate ? new Date(body.dueDate) : null;

  const columnId = body.columnId;
  const title = body.title?.trim();
  const description = body.description?.trim() || "";
  const assigneeIds = Array.isArray(body.assigneeIds)
    ? body.assigneeIds
    : [];

  if (!title) {
    return NextResponse.json(
      { message: "Kart başlığı gerekli" },
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

  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      boardId: project.board.id,
    },
  });

  if (!column) {
    return NextResponse.json(
      { message: "Sütun bulunamadı" },
      { status: 404 }
    );
  }

  const projectMemberIds = project.members.map((member) => member.userId);

  const validAssigneeIds = assigneeIds.filter((assigneeId: string) =>
    projectMemberIds.includes(assigneeId)
  );

  if (validAssigneeIds.length === 0) {
    validAssigneeIds.push(user.userId);
  }

  const lastCard = await prisma.card.findFirst({
    where: {
      columnId,
    },
    orderBy: {
      order: "desc",
    },
  });

  const card = await prisma.card.create({
    data: {
      title,
      description,
      columnId,
      dueDate,
      order: lastCard ? lastCard.order + 1 : 0,
      creatorId: user.userId,
      assignees: {
        create: validAssigneeIds.map((assigneeId: string) => ({
          userId: assigneeId,
        })),
      },
    },
  });

  return NextResponse.json(card, { status: 201 });
}