import Link from "next/link";

export default function Topbar({
  userEmail,
}: {
  userEmail?: string;
}) {
  return (
    <header className="border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/projects" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-600 shadow-lg shadow-red-600/30" />
          <span className="text-lg font-bold text-white">TaskFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="hidden text-sm text-zinc-400 sm:block">
              {userEmail}
            </span>
          )}

          <form action="/api/auth/logout" method="post">
            <button className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10">
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}