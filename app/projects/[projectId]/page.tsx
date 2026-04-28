import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddCardDialog from "./AddCardDialog";
import KanbanBoard from "./KanbanBoard";
import Topbar from "../../components/Topbar";
import Footer from "../../components/Footer";

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { projectId } = await params;

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
            include: {
              cards: {
                include: {
                  creator: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  assignees: {
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
                  subtasks: {
  include: {
    assignee: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
  orderBy: {
    createdAt: "asc",
  },
},
                },
                orderBy: {
                  order: "asc",
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
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
  });

  if (!project || !project.board) {
    redirect("/projects");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Topbar userEmail={user.email} />

      <section className="mx-auto min-h-[calc(100vh-145px)] max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/projects"
                className="text-sm font-medium text-red-400 hover:text-red-300"
              >
                ← Projelere dön
              </Link>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                {project.name}
              </h1>

              <p className="mt-2 max-w-2xl text-zinc-400">
                {project.description || "Proje board’u"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                  {project.members.length} üye
                </span>

                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
                  {project.board.columns.length} sütun
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <AddCardDialog
                projectId={project.id}
                currentUserId={user.userId}
                columns={project.board.columns.map((column) => ({
                  id: column.id,
                  title: column.title,
                }))}
                members={project.members.map((member) => ({
                  id: member.user.id,
                  name: member.user.name,
                  email: member.user.email,
                }))}
              />

              <Link
                href={`/projects/${project.id}/settings`}
                className="rounded-2xl border border-white/10 bg-black px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
              >
                Proje Ayarları
              </Link>
            </div>
          </div>
        </div>

        <KanbanBoard
  projectId={project.id}
  initialColumns={project.board.columns}
  members={project.members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    userId: member.user.id,
  }))}
  currentUserId={user.userId}
/>
      </section>

      <Footer />
    </main>
  );
}