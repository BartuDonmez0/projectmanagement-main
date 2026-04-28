import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: user.userId,
        },
      },
    },
    include: {
      board: true,
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();

  const name = body.name?.trim();
  const description = body.description?.trim();

  if (!name) {
    return NextResponse.json(
      { message: "Proje adı gerekli" },
      { status: 400 }
    );
  }

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name,
        description,
        ownerId: user.userId,
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: createdProject.id,
        userId: user.userId,
        role: "OWNER",
      },
    });

    const board = await tx.board.create({
      data: {
        title: `${name} Board`,
        projectId: createdProject.id,
      },
    });

    await tx.column.createMany({
      data: [
        {
          title: "Yapılacak",
          order: 0,
          boardId: board.id,
        },
        {
          title: "Devam Ediyor",
          order: 1,
          boardId: board.id,
        },
        {
          title: "Tamamlandı",
          order: 2,
          boardId: board.id,
        },
      ],
    });

    return createdProject;
  });

  return NextResponse.json(project, { status: 201 });
}