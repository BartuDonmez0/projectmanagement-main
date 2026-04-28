"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Topbar({
  userEmail,
}: {
  userEmail?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
  }


  return (
    <header className="border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3">
        <Link href="/projects" className="flex items-center">
          <Image
            src="/logoo.png"
            alt="TaskFlow"
            width={60}
            height={60}
            className="rounded-xl"
          />
          <span className="text-lg font-bold text-white">TaskFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="hidden text-sm text-zinc-400 sm:block">
              {userEmail}
            </span>
          )}
          <Link
            href="/projects"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
          >
            Projeler
          </Link>


          <Link
            href="/profile"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
          >
            Profil
          </Link>


          <button className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10" onClick={handleLogout}>
            Çıkış Yap
          </button>

        </div>
      </div>
    </header>
  );
}