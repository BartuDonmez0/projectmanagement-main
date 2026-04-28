"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import AddCardDialog from "./AddCardDialog";
import KanbanBoard from "./KanbanBoard";
import AddColumnDialog from "./AddColumnDialog";

type Member = {
  id: string;
  name: string | null;
  email: string;
};

type BoardData = {
  currentUserId: string;
  isOwner: boolean;
  project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    members: {
      id: string;
      user: Member;
    }[];
    board: {
      id: string;
      columns: {
        id: string;
        title: string;
        order: number;
        cards: {
          id: string;
          title: string;
          description: string | null;
          order: number;
          columnId: string;
          dueDate: string | null;
          creator: Member;
          assignees: {
            user: Member;
          }[];
          subtasks: {
            id: string;
            title: string;
            isCompleted: boolean;
            dueDate: string | null;
            assignee: Member | null;
          }[];
        }[];
      }[];
    };
  };
};

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (res.status === 401) {
    window.location.href = "/login";
    return null;
  }

  if (res.status === 404) {
    window.location.href = "/projects";
    return null;
  }

  if (!res.ok) {
    throw new Error("Board yüklenemedi");
  }

  return res.json();
};

export default function ProjectBoardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const { data, isLoading, mutate } = useSWR<BoardData | null>(
    `/api/projects/${projectId}/board`,
    fetcher
  );

  if (isLoading) {
    return (
      <section className="mx-auto min-h-[calc(100vh-145px)] max-w-7xl px-6 py-8">
        <p className="text-zinc-400">Board yükleniyor...</p>
      </section>
    );
  }

  if (!data) return null;

  const { project, currentUserId, isOwner } = data;

  const members = project.members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
  }));

  const boardKey = project.board.columns
    .map((column) =>
      `${column.id}:${column.cards
        .map(
          (card) =>
            `${card.id}:${card.subtasks.length}:${
              card.subtasks.filter((subtask) => subtask.isCompleted).length
            }`
        )
        .join(",")}`
    )
    .join("|");

  return (
    <section className="mx-auto min-h-[calc(100vh-145px)] max-w-7xl px-6 py-8">
      <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/projects"
              className="text-sm font-medium text-red-400 hover:text-red-300"
            >
              ← Projelere dön
            </Link>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
              {project.name}
            </h1>

            <p className="mt-2 max-w-2xl text-zinc-400">
              {project.description || "Proje board’u"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                {project.members.length} üye
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
                {project.board.columns.length} sütun
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isOwner && (
              <AddColumnDialog
                projectId={project.id}
                onCreated={() => mutate()}
              />
            )}

            <AddCardDialog
              projectId={project.id}
              currentUserId={currentUserId}
              columns={project.board.columns.map((column) => ({
                id: column.id,
                title: column.title,
              }))}
              members={members}
              onCreated={() => mutate()}
            />

            <Link
              href={`/projects/${project.id}/settings`}
              className="rounded-2xl border border-white/10 bg-black px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
            >
              Proje Ayarları
            </Link>
          </div>
        </div>
      </div>

      <KanbanBoard
        key={boardKey}
        projectId={project.id}
        initialColumns={project.board.columns}
        members={members}
        currentUserId={currentUserId}
        isOwner={isOwner}
        onChanged={() => mutate()}
      />
    </section>
  );
}