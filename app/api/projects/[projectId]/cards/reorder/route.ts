import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type ReorderColumn = {
  columnId: string;
  cards: {
    id: string;
    order: number;
  }[];
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await req.json();

  const columns = body.columns as ReorderColumn[];

  if (!Array.isArray(columns)) {
    return NextResponse.json(
      { message: "Geçersiz sıralama verisi" },
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
    },
  });

  if (!project || !project.board) {
    return NextResponse.json(
      { message: "Proje bulunamadı" },
      { status: 404 }
    );
  }

  const validColumnIds = project.board.columns.map((column) => column.id);

  const isInvalidColumn = columns.some(
    (column) => !validColumnIds.includes(column.columnId)
  );

  if (isInvalidColumn) {
    return NextResponse.json(
      { message: "Geçersiz sütun" },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    columns.flatMap((column) =>
      column.cards.map((card) =>
        prisma.card.update({
          where: {
            id: card.id,
          },
          data: {
            columnId: column.columnId,
            order: card.order,
          },
        })
      )
    )
  );

  return NextResponse.json({ message: "Sıralama kaydedildi" });
}