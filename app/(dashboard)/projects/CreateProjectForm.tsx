"use client";

import { useState } from "react";

export default function CreateProjectForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      alert("Proje oluşturulamadı");
      return;
    }

    setName("");
    setDescription("");

    onCreated?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-red-400">Yeni çalışma alanı</p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Yeni Proje Oluştur
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Proje adını ve kısa açıklamasını girerek board’unu oluştur.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr_auto]">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Proje adı
          </label>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
            placeholder="Örn: TaskFlow MVP"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Açıklama
          </label>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
            placeholder="Örn: Kanban proje yönetim uygulaması"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 lg:w-auto"
          >
            Oluştur
          </button>
        </div>
      </div>
    </form>
  );
}