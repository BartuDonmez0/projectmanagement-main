"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMemberForm({
  projectId,
}: {
  projectId: string;
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
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-zinc-950">
        Üye Ekle
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Kullanıcı email adresi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Ekle
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}