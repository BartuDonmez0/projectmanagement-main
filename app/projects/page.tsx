import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateProjectForm from "./CreateProjectForm";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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
      members: true,
      board: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Topbar userEmail={user.email} />

      <section className="mx-auto min-h-[calc(100vh-145px)] max-w-6xl px-6 py-10">
        <div className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-br from-red-700 via-red-950 to-zinc-950 p-8 shadow-2xl">
          <div className="max-w-2xl">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-red-100">
              Proje Yönetim Paneli
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight">
              Projelerini tek yerden yönet.
            </h1>

            <p className="mt-3 text-zinc-300">
              Board oluştur, ekip üyelerini ekle, kartları ata ve görevleri
              sürükle-bırak ile takip et.
            </p>
          </div>
        </div>

        <CreateProjectForm />

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Projelerim</h2>
            <span className="text-sm text-zinc-500">
              {projects.length} proje
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl transition hover:-translate-y-1 hover:border-red-500/50 hover:bg-zinc-900"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-red-600 shadow-lg shadow-red-600/20" />

                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                    Board
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {project.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                  {project.description || "Açıklama yok"}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <span className="text-zinc-500">
                    {project.members.length} üye
                  </span>

                  <span className="font-medium text-red-400 transition group-hover:text-red-300">
                    Board aç →
                  </span>
                </div>
              </Link>
            ))}

            {projects.length === 0 && (
              <div className="rounded-3xl border border-dashed border-red-500/30 bg-red-500/5 p-10 text-center text-zinc-400 sm:col-span-2 lg:col-span-3">
                Henüz proje yok. İlk projeni oluştur.
              </div>
            )}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}