"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import AddMemberForm from "./AddMemberForm";

type ProjectMember = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type SettingsData = {
  currentUserId: string;
  isOwner: boolean;
  project: {
    id: string;
    name: string;
    ownerId: string;
    members: ProjectMember[];
  };
};

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (res.status === 401) {
    window.location.href = "/login";
    return null;
  }

  if (res.status === 404) {
    window.location.href = "/projects";
    return null;
  }

  if (!res.ok) {
    throw new Error("Proje ayarları yüklenemedi");
  }

  return res.json();
};

export default function ProjectSettingsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const { data, isLoading, mutate } = useSWR<SettingsData | null>(
    `/api/projects/${projectId}/settings`,
    fetcher
  );

  if (isLoading) {
    return (
      <section className="mx-auto min-h-[calc(100vh-145px)] max-w-5xl px-6 py-8">
        <p className="text-zinc-400">Proje ayarları yükleniyor...</p>
      </section>
    );
  }

  if (!data) return null;

  const { project, isOwner } = data;

  return (
    <section className="mx-auto min-h-[calc(100vh-145px)] max-w-5xl px-6 py-8">
      <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm font-medium text-red-400 hover:text-red-300"
        >
          ← Board’a dön
        </Link>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Proje Ayarları
        </h1>

        <p className="mt-2 text-zinc-400">{project.name}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
            {project.members.length} üye
          </span>

          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
            {isOwner ? "OWNER" : "MEMBER"}
          </span>
        </div>
      </div>

      {isOwner ? (
        <AddMemberForm projectId={project.id} onAdded={() => mutate()} />
      ) : (
        <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Bu projede üye ekleme yetkin yok.
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">Ekip Yönetimi</p>
            <h2 className="mt-1 text-2xl font-bold">Proje Üyeleri</h2>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
            {project.members.length} kişi
          </span>
        </div>

        <div className="space-y-3">
          {project.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black p-4 transition hover:border-red-500/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-600/20">
                  {(member.user.name || member.user.email)
                    .slice(0, 1)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {member.user.name || "İsimsiz kullanıcı"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  member.role === "OWNER"
                    ? "bg-red-500/10 text-red-300"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}