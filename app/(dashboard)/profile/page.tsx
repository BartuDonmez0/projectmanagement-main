"use client";

import Link from "next/link";
import useSWR from "swr";
import ProfileSettingsWrapper from "./ProfileSettingsWrapper";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  projects: {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    project: {
      id: string;
      name: string;
      description: string | null;
      members: unknown[];
      board: {
        columns: {
          id: string;
          cards: unknown[];
        }[];
      } | null;
    };
  }[];
  ownedProjects: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
  }[];
};

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (res.status === 401) {
    window.location.href = "/login";
    return null;
  }

  if (!res.ok) {
    throw new Error("Profil yüklenemedi");
  }

  return res.json();
};

export default function ProfilePage() {
  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR<ProfileUser | null>("/api/profile", fetcher);

  if (isLoading) {
    return (
      <section className="mx-auto min-h-[calc(100vh-145px)] max-w-6xl px-6 py-8 text-white">
        Profil yükleniyor...
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="mx-auto min-h-[calc(100vh-145px)] max-w-6xl px-6 py-8">
      {/* HEADER */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-red-700 via-red-950 to-zinc-950 p-8 shadow-2xl">
        <p className="text-sm font-medium text-red-100">Profil</p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Hesap Bilgileri
        </h1>

        <p className="mt-2 text-zinc-300">
          Profil bilgilerini ve dahil olduğun projeleri buradan görebilirsin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        {/* SOL */}
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-600 text-2xl font-bold shadow-lg shadow-red-600/25">
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {user.name || "İsimsiz Kullanıcı"}
                </h2>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>

            <ProfileSettingsWrapper
              name={user.name}
              email={user.email}
              onUpdated={() => mutate()}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <p className="text-xs uppercase text-zinc-500">
                İsim Soyisim
              </p>
              <p className="mt-1 text-zinc-200">
                {user.name || "Belirtilmemiş"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <p className="text-xs uppercase text-zinc-500">
                Email
              </p>
              <p className="mt-1 text-zinc-200">{user.email}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <p className="text-xs uppercase text-zinc-500">
                Kayıt Tarihi
              </p>
              <p className="mt-1 text-zinc-200">
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-red-500/10 p-4">
                <p className="text-2xl font-bold text-red-300">
                  {user.projects.length}
                </p>
                <p className="text-sm text-zinc-400">
                  Dahil olduğu proje
                </p>
              </div>

              <div className="rounded-2xl bg-red-500/10 p-4">
                <p className="text-2xl font-bold text-red-300">
                  {user.ownedProjects.length}
                </p>
                <p className="text-sm text-zinc-400">
                  Sahip olduğu proje
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SAĞ */}
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-400">Proje Geçmişi</p>
              <h2 className="text-2xl font-bold">
                Dahil Olduğun Projeler
              </h2>
            </div>

            <Link
              href="/projects"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-red-500/50 hover:text-red-300"
            >
              Projelere Git
            </Link>
          </div>

          <div className="space-y-3">
            {user.projects.map((membership) => {
              const project = membership.project;

              const cardCount =
                project.board?.columns.reduce(
                  (total, column) => total + column.cards.length,
                  0
                ) || 0;

              return (
                <Link
                  key={membership.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-2xl border border-white/10 bg-black p-5 hover:border-red-500/40 hover:bg-zinc-900"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-white">
                        {project.name}
                      </h3>

                      <p className="text-sm text-zinc-500">
                        {project.description || "Açıklama yok"}
                      </p>
                    </div>

                    <span className="inline-flex h-7 items-center justify-center rounded-full bg-white/5 px-3 text-xs font-semibold leading-none text-zinc-400">
  {membership.role}
</span>
                  </div>

                  <div className="mt-3 flex gap-2 text-xs">
                    <span className="bg-white/5 px-2 py-1 rounded">
                      {project.members.length} üye
                    </span>

                    <span className="bg-white/5 px-2 py-1 rounded">
                      {project.board?.columns.length || 0} sütun
                    </span>

                    <span className="bg-white/5 px-2 py-1 rounded">
                      {cardCount} kart
                    </span>
                  </div>
                </Link>
              );
            })}

            {user.projects.length === 0 && (
              <div className="text-center text-zinc-500 p-8 border border-dashed border-white/10 rounded-2xl">
                Henüz dahil olduğun proje yok.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}