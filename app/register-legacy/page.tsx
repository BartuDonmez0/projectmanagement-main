"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      let message = "Kayıt başarısız. Bilgileri kontrol et.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data?.message) message = data.message;
      } catch {
        // ignore
      }
      setError(message);
      return;
    }

    router.push("/projects");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-red-700 via-red-950 to-black p-12 lg:flex">
          <div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              TaskFlow
            </div>

            <h1 className="mt-10 max-w-xl text-5xl font-bold leading-tight">
              Ekibin için güçlü bir Kanban çalışma alanı oluştur.
            </h1>

            <p className="mt-6 max-w-md text-lg text-red-100">
              Proje oluştur, üyeleri ekle, görevleri ata ve kartları
              sürükleyerek akışı yönet.
            </p>
          </div>

          <p className="text-sm text-red-100/80">
            Hızlı, sade ve odaklı görev yönetimi.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl"
          >
            <div className="mb-8">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-red-600 shadow-lg shadow-red-600/30" />

              <h2 className="text-3xl font-bold">Kayıt Ol</h2>

              <p className="mt-2 text-sm text-zinc-400">
                TaskFlow ile proje yönetimine başla.
              </p>
            </div>

            <div className="space-y-4">
              <input
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="İsim"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button className="mt-6 w-full rounded-2xl bg-red-600 p-3 font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700">
              Kayıt Ol
            </button>

            <p className="mt-6 text-center text-sm text-zinc-400">
              Zaten hesabın var mı?{" "}
              <Link
                href="/login"
                className="font-semibold text-red-400 hover:text-red-300"
              >
                Giriş Yap
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}