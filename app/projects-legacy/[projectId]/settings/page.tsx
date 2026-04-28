import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import AddMemberForm from "./AddMemberForm";

export default async function ProjectSettingsPage({
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
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!project) {
    redirect("/projects");
  }

  const isOwner = project.ownerId === user.userId;

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href={`/projects/${project.id}`}
            className="text-sm text-zinc-500 hover:text-black"
          >
            ← Board’a dön
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-zinc-950">
            Proje Ayarları
          </h1>

          <p className="mt-1 text-zinc-600">{project.name}</p>
        </div>

        {isOwner && <AddMemberForm projectId={project.id} />}

        {!isOwner && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Bu projede üye ekleme yetkin yok.
          </div>
        )}

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-950">
            Proje Üyeleri
          </h2>

          <div className="space-y-3">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
              >
                <div>
                  <p className="font-medium text-zinc-950">
                    {member.user.name || "İsimsiz kullanıcı"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {member.user.email}
                  </p>
                </div>

                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}