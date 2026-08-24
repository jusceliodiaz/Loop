"use client";

import type { Participant } from "livekit-client";
import { UserX } from "lucide-react";
import { AppMembersList, MemberRow } from "./AppMembersList";
import { useAppUser } from "@/lib/appUser";

export function MembersPanel({ roomId, roomParticipants }: { roomId: string; roomParticipants: Participant[] }) {
  const self = useAppUser();
  const isAdmin = self.role === "admin";

  async function kick(identity: string) {
    await fetch(`/api/rooms/${roomId}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity }),
    });
  }

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-stroke-soft bg-bg-sidebar px-4 py-5 [@media(min-width:1100px)]:flex">
      <div className="flex flex-col gap-0.5">
        <span className="mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
          Nesta sala — {roomParticipants.length}
        </span>
        {roomParticipants.length === 0 && <p className="px-2 text-[13px] text-text-3">Ninguém aqui ainda.</p>}
        {roomParticipants.map((p) =>
          isAdmin && p.identity !== self.id ? (
            <div key={p.identity} className="flex items-center gap-1">
              <div className="flex-1">
                <MemberRow name={p.name || p.identity} online />
              </div>
              <button
                type="button"
                title="Remover da sala"
                onClick={() => kick(p.identity)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:bg-glass-2 hover:text-alert"
              >
                <UserX size={13} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <MemberRow key={p.identity} name={p.name || p.identity} online />
          ),
        )}
      </div>

      <AppMembersList />
    </aside>
  );
}
