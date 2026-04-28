"use client";

import { useState } from "react";

type Column = {
  id: string;
  title: string;
};

type ProjectMember = {
  id: string;
  name: string | null;
  email: string;
};

export default function AddCardDialog({
  projectId,
  columns,
  members,
  currentUserId,
  onCreated,
}: {
  projectId: string;
  columns: Column[];
  members: ProjectMember[];
  currentUserId: string;
  onCreated?: () => void;
}) {

  const [open, setOpen] = useState(false);
  const [columnId, setColumnId] = useState(columns[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([currentUserId]);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  function toggleAssignee(userId: string) {
    setAssigneeIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }

      return [...prev, userId];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/projects/${projectId}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        columnId,
        title,
        description,
        assigneeIds,
        dueDate,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Kart oluşturulamadı");
      return;
    }

    setTitle("");
    setDescription("");
    setColumnId(columns[0]?.id || "");
    setAssigneeIds([currentUserId]);
    setDueDate("");
    setOpen(false);


    onCreated?.();

  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
      >
        + Kart Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-red-400">
                  Yeni Görev
                </p>

                <h2 className="text-2xl font-bold">Kart Ekle</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Görev bilgilerini gir ve ekip üyelerine ata.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Sütun
                </label>

                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  required
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Başlık
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  placeholder="Örn: Login ekranını tasarla"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Açıklama
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  placeholder="Kart detaylarını yaz..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Beklenen Bitiş Tarihi
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Görev Atanacak Kişiler
                </label>

                <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black p-3">
                  {members.map((member) => {
                    const checked = assigneeIds.includes(member.id);

                    return (
                      <label
                        key={member.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${checked
                            ? "border-red-500/40 bg-red-500/10"
                            : "border-white/5 hover:border-red-500/30 hover:bg-white/5"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAssignee(member.id)}
                          className="accent-red-600"
                        />

                        <span className="text-sm text-zinc-300">
                          {member.name || member.email}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Hiç kimse seçilmezse görev otomatik olarak sana atanır.
                </p>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 bg-black px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}