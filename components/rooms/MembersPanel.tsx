"use client";

import { useEffect, useState } from "react";
import type { Participant } from "livekit-client";

type Member = { id: string; name: string; online: boolean };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function MemberRow({ name, online }: { name: string; online: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 ${online ? "text-text-1" : "text-text-3"}`}>
      <span className="relative shrink-0">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] font-medium text-white ${
            online ? "" : "opacity-40"
          }`}
        >
          {initials(name)}
        </span>
        <span
          className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-sidebar ${
            online ? "bg-live" : "border-text-3 bg-transparent"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-[450]">{name}</span>
    </div>
  );
}

export function MembersPanel({ roomParticipants }: { roomParticipants: Participant[] }) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/members");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMembers(data.members ?? []);
      } catch {
        // ignore transient network errors, next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const online = members.filter((m) => m.online);
  const offline = members.filter((m) => !m.online);

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

      <div className="flex flex-col gap-0.5">
        <span className="mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
          Todo o LOOP — {online.length} online
        </span>
        {online.map((m) => (
          <MemberRow key={m.id} name={m.name} online />
        ))}
        {offline.length > 0 && (
          <>
            <span className="mt-4 mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
              Offline — {offline.length}
            </span>
            {offline.map((m) => (
              <MemberRow key={m.id} name={m.name} online={false} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
