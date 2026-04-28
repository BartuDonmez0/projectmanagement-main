"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
}: {
  projectId: string;
  columns: Column[];
  members: ProjectMember[];
  currentUserId: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [columnId, setColumnId] = useState(columns[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([currentUserId]);
  const [error, setError] = useState("");
  const [dueDate,setDueDate]=useState("");

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

    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        + Kart Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-950">
                Yeni Kart Ekle
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Sütun
                </label>

                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
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
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Başlık
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Örn: Login ekranını tasarla"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Açıklama
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Kart detaylarını yaz..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Görev Atanacak Kişiler
                </label>

                <div className="space-y-2 rounded-xl border border-zinc-200 p-3">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-zinc-50"
                    >
                      <input
                        type="checkbox"
                        checked={assigneeIds.includes(member.id)}
                        onChange={() => toggleAssignee(member.id)}
                      />

                      <span className="text-sm text-zinc-700">
                        {member.name || member.email}
                      </span>
                    </label>
                  ))}
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  Hiç kimse seçilmezse görev otomatik olarak sana atanır.
                </p>
              </div>

              <div>
  <label className="mb-1 block text-sm font-medium text-zinc-300">
    Beklenen Bitiş Tarihi
  </label>

  <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
  />
</div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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