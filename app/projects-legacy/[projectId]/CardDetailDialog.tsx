"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string | null;
  email: string;
};

type Subtask = {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: Date | string | null;
  assignee: Member | null;
};

type Card = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string | null;
  creator: Member;
  assignees: {
    user: Member;
  }[];
  subtasks: Subtask[];
};

export default function CardDetailDialog({
  projectId,
  card,
  members,
  currentUserId,
  onClose,
}: {
  projectId: string;
  card: Card;
  members: Member[];
  currentUserId: string;
  onClose: () => void;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const completedCount = card.subtasks.filter(
    (subtask) => subtask.isCompleted
  ).length;

  async function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(
      `/api/projects/${projectId}/cards/${card.id}/subtasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          assigneeId: assigneeId || null,
          dueDate,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Mini task eklenemedi");
      return;
    }

    setTitle("");
    setAssigneeId("");
    setDueDate("");

    router.refresh();
    onClose();
  }

  async function toggleSubtask(subtaskId: string, isCompleted: boolean) {
    setError("");

    const res = await fetch(
      `/api/projects/${projectId}/cards/${card.id}/subtasks/${subtaskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Mini task durumu güncellenemedi");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-red-400">
              Kart Detayı
            </p>

            <h2 className="text-2xl font-bold">{card.title}</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Oluşturan: {card.creator.name || card.creator.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <section className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <h3 className="mb-2 text-sm font-semibold text-zinc-300">
              Açıklama
            </h3>

            <p className="text-sm leading-6 text-zinc-400">
              {card.description || "Açıklama eklenmemiş."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">
                Beklenen Bitiş Tarihi
              </h3>

              <p className="text-sm text-zinc-400">
                {card.dueDate
                  ? new Date(card.dueDate).toLocaleDateString("tr-TR")
                  : "Tarih belirlenmemiş"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">
                Atanan Kişiler
              </h3>

              <div className="flex flex-wrap gap-2">
                {card.assignees.map((assignee) => (
                  <span
                    key={assignee.user.id}
                    className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300"
                  >
                    {assignee.user.name || assignee.user.email}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-300">
                Mini Tasklar
              </h3>

              <span className="text-xs text-zinc-500">
                {completedCount}/{card.subtasks.length} tamamlandı
              </span>
            </div>

            <div className="space-y-3">
              {card.subtasks.map((subtask) => {
                const isOwner = subtask.assignee?.id === currentUserId;

                return (
                  <div
                    key={subtask.id}
                    className="rounded-xl border border-white/10 bg-zinc-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`font-medium ${
                            subtask.isCompleted
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {subtask.title}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>
                            Atanan:{" "}
                            {subtask.assignee
                              ? subtask.assignee.name || subtask.assignee.email
                              : "Yok"}
                          </span>

                          <span>
                            Tarih:{" "}
                            {subtask.dueDate
                              ? new Date(subtask.dueDate).toLocaleDateString(
                                  "tr-TR"
                                )
                              : "Yok"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <button
                          type="button"
                          disabled={!isOwner}
                          onClick={() =>
                            toggleSubtask(
                              subtask.id,
                              !subtask.isCompleted
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            subtask.isCompleted
                              ? "bg-green-500/10 text-green-300"
                              : "bg-red-500/10 text-red-300"
                          } ${
                            !isOwner
                              ? "cursor-not-allowed opacity-40"
                              : "hover:bg-white/10"
                          }`}
                        >
                          {subtask.isCompleted
                            ? "Tamamlandı"
                            : "Tamamlanmadı"}
                        </button>

                        {!isOwner && (
                          <p className="mt-1 text-right text-[11px] text-zinc-500">
                            Sadece atanan kişi değiştirebilir
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {card.subtasks.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-zinc-500">
                  Henüz mini task yok.
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={handleAddSubtask}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4"
          >
            <h3 className="mb-4 text-sm font-semibold text-red-300">
              Mini Task Ekle
            </h3>

            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yapılacak şeyi yaz..."
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
                >
                  <option value="">Kişi seç</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button
                type="submit"
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Mini Task Ekle
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}