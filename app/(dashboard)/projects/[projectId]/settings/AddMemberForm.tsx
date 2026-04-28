"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMemberForm({
  projectId,
  onAdded,
}: {
  projectId: string;
  onAdded?: () => void;
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Üye eklenemedi");
      return;
    }

    
    setEmail("");
    onAdded?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl"
    >
      <div className="mb-5">
        <p className="text-sm font-medium text-red-400">Ekip Yönetimi</p>

        <h2 className="mt-1 text-2xl font-bold text-white">Üye Ekle</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Projeye eklemek istediğin kayıtlı kullanıcının email adresini gir.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
          placeholder="ornek@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
        >
          Üye Ekle
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}