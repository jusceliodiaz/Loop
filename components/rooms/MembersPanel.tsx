"use client";

import type { Participant } from "livekit-client";
import { AppMembersList, MemberRow } from "./AppMembersList";

export function MembersPanel({ roomParticipants }: { roomParticipants: Participant[] }) {
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-stroke-soft bg-bg-sidebar px-4 py-5 [@media(min-width:1100px)]:flex">
      <div className="flex flex-col gap-0.5">
        <span className="mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
          Nesta sala — {roomParticipants.length}
        </span>
        {roomParticipants.length === 0 && <p className="px-2 text-[13px] text-text-3">Ninguém aqui ainda.</p>}
        {roomParticipants.map((p) => (
          <MemberRow key={p.identity} name={p.name || p.identity} online />
        ))}
      </div>

      <AppMembersList />
    </aside>
  );
}
