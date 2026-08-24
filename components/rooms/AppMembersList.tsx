"use client";

import { useEffect, useState } from "react";
import { SupporterBadge } from "./SupporterBadge";

export type Member = { id: string; name: string; online: boolean; isSupporter?: boolean };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function useAppMembers() {
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

  return members;
}

export function MemberRow({ name, online, isSupporter }: { name: string; online: boolean; isSupporter?: boolean }) {
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
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-[14px] font-[450]">{name}</span>
        {isSupporter && <SupporterBadge />}
      </span>
    </div>
  );
}

export function AppMembersList() {
  const members = useAppMembers();
  const online = members.filter((m) => m.online);
  const offline = members.filter((m) => !m.online);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
        Todo o LOOP — {online.length} online
      </span>
      {online.map((m) => (
        <MemberRow key={m.id} name={m.name} online isSupporter={m.isSupporter} />
      ))}
      {offline.length > 0 && (
        <>
          <span className="mt-4 mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
            Offline — {offline.length}
          </span>
          {offline.map((m) => (
            <MemberRow key={m.id} name={m.name} online={false} isSupporter={m.isSupporter} />
          ))}
        </>
      )}
    </div>
  );
}
