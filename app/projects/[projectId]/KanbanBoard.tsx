"use client";

import { useRef, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardDetailDialog from "./CardDetailDialog";

type Member = {
  id: string;
  name: string | null;
  email: string;
};

type Assignee = {
  user: Member;
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
  order: number;
  columnId: string;
  dueDate: Date | string | null;
  creator: Member;
  assignees: Assignee[];
  subtasks: Subtask[];
};

type Column = {
  id: string;
  title: string;
  order: number;
  cards: Card[];
};

export default function KanbanBoard({
  projectId,
  initialColumns,
  members,
  currentUserId,
}: {
  projectId: string;
  initialColumns: Column[];
  members: Member[];
  currentUserId: string;
}) {
  const [columns, setColumnsState] = useState<Column[]>(initialColumns);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const columnsRef = useRef<Column[]>(initialColumns);

  function setColumns(nextColumns: Column[]) {
    columnsRef.current = nextColumns;
    setColumnsState(nextColumns);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  function findColumnByCardId(
    cardId: string,
    sourceColumns = columnsRef.current
  ) {
    return sourceColumns.find((column) =>
      column.cards.some((card) => card.id === cardId)
    );
  }

  function findColumnById(
    columnId: string,
    sourceColumns = columnsRef.current
  ) {
    return sourceColumns.find((column) => column.id === columnId);
  }

  function normalizeOrders(sourceColumns: Column[]) {
    return sourceColumns.map((column) => ({
      ...column,
      cards: column.cards.map((card, index) => ({
        ...card,
        columnId: column.id,
        order: index,
      })),
    }));
  }

  function moveCardBetweenColumns(
    sourceColumns: Column[],
    activeId: string,
    overId: string
  ) {
    const activeColumn = findColumnByCardId(activeId, sourceColumns);
    const overColumn =
      findColumnByCardId(overId, sourceColumns) ||
      findColumnById(overId, sourceColumns);

    if (!activeColumn || !overColumn) return sourceColumns;
    if (activeColumn.id === overColumn.id) return sourceColumns;

    const activeColumnIndex = sourceColumns.findIndex(
      (column) => column.id === activeColumn.id
    );
    const overColumnIndex = sourceColumns.findIndex(
      (column) => column.id === overColumn.id
    );

    const activeCardIndex = sourceColumns[activeColumnIndex].cards.findIndex(
      (card) => card.id === activeId
    );

    const activeCard = sourceColumns[activeColumnIndex].cards[activeCardIndex];

    if (!activeCard) return sourceColumns;

    const overCardIndex = sourceColumns[overColumnIndex].cards.findIndex(
      (card) => card.id === overId
    );

    const insertIndex =
      overCardIndex >= 0
        ? overCardIndex
        : sourceColumns[overColumnIndex].cards.length;

    const nextColumns = sourceColumns.map((column) => ({
      ...column,
      cards: [...column.cards],
    }));

    nextColumns[activeColumnIndex].cards = nextColumns[
      activeColumnIndex
    ].cards.filter((card) => card.id !== activeId);

    nextColumns[overColumnIndex].cards.splice(insertIndex, 0, {
      ...activeCard,
      columnId: overColumn.id,
    });

    return normalizeOrders(nextColumns);
  }

  function moveCardInsideColumn(
    sourceColumns: Column[],
    activeId: string,
    overId: string
  ) {
    const activeColumn = findColumnByCardId(activeId, sourceColumns);
    const overColumn = findColumnByCardId(overId, sourceColumns);

    if (!activeColumn || !overColumn) return sourceColumns;
    if (activeColumn.id !== overColumn.id) return sourceColumns;

    const oldIndex = activeColumn.cards.findIndex(
      (card) => card.id === activeId
    );
    const newIndex = activeColumn.cards.findIndex((card) => card.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return sourceColumns;
    }

    return normalizeOrders(
      sourceColumns.map((column) => {
        if (column.id !== activeColumn.id) return column;

        return {
          ...column,
          cards: arrayMove(column.cards, oldIndex, newIndex),
        };
      })
    );
  }

  async function saveOrder(nextColumns: Column[]) {
    const res = await fetch(`/api/projects/${projectId}/cards/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columns: nextColumns.map((column) => ({
          columnId: column.id,
          cards: column.cards.map((card, index) => ({
            id: card.id,
            order: index,
          })),
        })),
      }),
    });

    if (!res.ok) {
      console.error("Sıralama kaydedilemedi");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;

    if (!overId) return;

    const nextColumns = moveCardBetweenColumns(
      columnsRef.current,
      activeId,
      overId
    );

    setColumns(nextColumns);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;

    setActiveCardId(null);

    if (!overId) return;

    let nextColumns = columnsRef.current;

    nextColumns = moveCardBetweenColumns(nextColumns, activeId, overId);
    nextColumns = moveCardInsideColumn(nextColumns, activeId, overId);
    nextColumns = normalizeOrders(nextColumns);

    setColumns(nextColumns);
    await saveOrder(nextColumns);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <section className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              activeCardId={activeCardId}
              onCardClick={setSelectedCard}
            />
          ))}
        </section>
      </DndContext>

      {selectedCard && (
       <CardDetailDialog
  projectId={projectId}
  card={selectedCard}
  members={members}
  currentUserId={currentUserId}
  onClose={() => setSelectedCard(null)}
/>
      )}
    </>
  );
}

function KanbanColumn({
  column,
  activeCardId,
  onCardClick,
}: {
  column: Column;
  activeCardId: string | null;
  onCardClick: (card: Card) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 rounded-3xl border p-4 transition ${
        isOver
          ? "border-red-500/50 bg-red-500/10"
          : "border-white/10 bg-zinc-950"
      }`}
    >
      <h2 className="mb-4 font-semibold text-white">{column.title}</h2>

      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-24 space-y-3">
          {column.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              isActive={activeCardId === card.id}
              onCardClick={onCardClick}
            />
          ))}

          {column.cards.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-500">
              Kart yok
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({
  card,
  isActive,
  onCardClick,
}: {
  card: Card;
  isActive: boolean;
  onCardClick: (card: Card) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = card.subtasks.filter(
    (subtask) => subtask.isCompleted
  ).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onCardClick(card)}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-2xl border border-white/10 bg-black p-4 shadow-sm transition active:cursor-grabbing ${
        isDragging || isActive
          ? "opacity-60 shadow-lg ring-2 ring-red-500/40"
          : "hover:border-red-500/40 hover:bg-zinc-900"
      }`}
    >
      <h3 className="font-medium text-white">{card.title}</h3>

      {card.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
          {card.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {card.dueDate && (
          <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">
            {new Date(card.dueDate).toLocaleDateString("tr-TR")}
          </span>
        )}

        {card.subtasks.length > 0 && (
          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-400">
            {completedSubtasks}/{card.subtasks.length} mini task
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.assignees.map((assignee) => (
          <span
            key={assignee.user.id}
            className="rounded-full bg-zinc-900 px-2 py-1 text-xs text-zinc-400"
          >
            {assignee.user.name || assignee.user.email}
          </span>
        ))}
      </div>

      <div className="mt-3 text-right text-[11px] text-zinc-600">
        Oluşturan: {card.creator.name || card.creator.email}
      </div>
    </div>
  );
}