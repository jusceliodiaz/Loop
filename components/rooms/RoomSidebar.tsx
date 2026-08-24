"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
import { Lock, MessageSquare, Plus, Volume2, X } from "lucide-react";
import { createRoom, type CreateRoomState } from "@/app/actions/rooms";
import type { Room } from "@/lib/rooms";
import { useVoicePresence } from "@/lib/useVoicePresence";
import { useUnreadCounts } from "@/lib/roomReads";
import { useAppUser } from "@/lib/appUser";
import { PlanComparisonDialog } from "./PlanComparisonDialog";

export function RoomSidebar({ rooms, canJoinVoice }: { rooms: Room[]; canJoinVoice: boolean }) {
  const pathname = usePathname();
  const self = useAppUser();
  const presence = useVoicePresence();
  const [creating, setCreating] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const voiceRooms = rooms.filter((r) => r.type === "voice");
  const textRooms = rooms.filter((r) => r.type === "text");
  const unread = useUnreadCounts(
    textRooms.map((r) => r.id),
    self.id,
  );

  return (
    <nav className="flex flex-col gap-3">
      {creating ? (
        <CreateRoomForm onClose={() => setCreating(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] text-text-2 transition-colors hover:bg-glass-1 hover:text-text-1"
        >
          <Plus size={17} strokeWidth={1.5} />
          Criar sala
        </button>
      )}

      <div className="flex flex-col gap-0.5">
        {voiceRooms.map((room) => {
          const active = pathname === `/room/${room.id}`;
          const count = presence[room.id]?.size ?? 0;
          const occupied = count > 0;

          if (!canJoinVoice) {
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setShowPlans(true)}
                title="Seu plano não inclui salas de voz"
                className="flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] text-text-3 transition-colors hover:bg-glass-1 hover:text-text-2"
              >
                <Volume2 size={15} strokeWidth={1.5} className="shrink-0" />
                <span className="flex-1 truncate text-left">{room.name}</span>
                {occupied && <span className="text-xs tabular-nums">{count}</span>}
                <Lock size={12} strokeWidth={1.5} className="shrink-0" />
              </button>
            );
          }

          return (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className={`flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] transition-colors ${
                active ? "bg-glass-2 text-text-1" : "text-text-2 hover:bg-glass-1 hover:text-text-1"
              }`}
            >
              <Volume2 size={15} strokeWidth={1.5} className="shrink-0 text-text-3" />
              <span className="flex-1 truncate">{room.name}</span>
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  occupied ? "bg-live" : "border border-text-3 bg-transparent"
                }`}
              />
              <span className="w-3 text-right text-xs tabular-nums text-text-3">{occupied ? count : ""}</span>
            </Link>
          );
        })}
      </div>

      {showPlans && <PlanComparisonDialog onClose={() => setShowPlans(false)} />}

      <div className="flex flex-col gap-0.5">
        {textRooms.map((room) => {
          const active = pathname === `/room/${room.id}`;
          const count = unread[room.id] ?? 0;
          return (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className={`flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] transition-colors ${
                active ? "bg-glass-2 text-text-1" : "text-text-2 hover:bg-glass-1 hover:text-text-1"
              }`}
            >
              <MessageSquare size={15} strokeWidth={1.5} className="shrink-0 text-text-3" />
              <span className={`flex-1 truncate ${count > 0 && !active ? "font-medium text-text-1" : ""}`}>{room.name}</span>
              {count > 0 && (
                <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-live px-1 text-[10px] font-medium text-black">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function CreateRoomForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState<CreateRoomState, FormData>(createRoom, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-[10px] bg-glass-1 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-2">Nova sala</span>
        <button type="button" onClick={onClose} className="text-text-3 hover:text-text-1">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
      <input
        name="name"
        placeholder="nome da sala"
        autoFocus
        maxLength={32}
        className="h-8 rounded-[8px] bg-glass-2 px-2.5 text-[13px] text-text-1 outline-none placeholder:text-text-3"
      />
      <select
        name="type"
        defaultValue="voice"
        className="h-8 rounded-[8px] bg-glass-2 px-2.5 text-[13px] text-text-1 outline-none"
      >
        <option value="voice">voz</option>
        <option value="text">texto</option>
      </select>
      {state.error && <span className="text-[11.5px] text-alert">{state.error}</span>}
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded-[8px] bg-glass-2 text-[13px] font-medium text-text-1 transition-colors hover:bg-glass-3 disabled:opacity-50"
      >
        {pending ? "criando…" : "Criar"}
      </button>
    </form>
  );
}
