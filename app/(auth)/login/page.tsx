"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isRegistered, setIsRegistered] = useState(false);

  // Avoid build-time CSR bailout warnings by reading search params on client after mount.
  // (This is equivalent behavior for showing the "registered" success banner.)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsRegistered(params.get("registered") === "true");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = "Email veya şifre hatalı.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data?.message) message = data.message;
      } catch {}
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
              Projelerini daha net, görevlerini daha hızlı yönet.
            </h1>

            <p className="mt-6 max-w-md text-lg text-red-100">
              Kanban board, ekip üyeleri, görev atamaları ve sürükle-bırak iş
              akışı tek yerde.
            </p>
          </div>

         
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl"
          >
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 shadow-lg shadow-red-600/20">
                <Image
                  src="/logoo.png"
                  alt="TaskFlow"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>

              <h2 className="text-3xl font-bold">Giriş Yap</h2>

              <p className="mt-2 text-sm text-zinc-400">
                TaskFlow hesabına giriş yap.
              </p>
            </div>
            {isRegistered && (
              <p className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                Kayıt başarılı. Giriş yapabilirsin.
              </p>
            )}

            <div className="space-y-4">
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
              Giriş Yap
            </button>

            <p className="mt-6 text-center text-sm text-zinc-400">
              Hesabın yok mu?{" "}
              <Link
                href="/register"
                className="font-semibold text-red-400 hover:text-red-300"
              >
                Kayıt Ol
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}