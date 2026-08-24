"use client";

import { useAppMembers } from "./AppMembersList";
import { SupporterBadge } from "./SupporterBadge";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PeopleCards() {
  const members = useAppMembers();

  if (members.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="px-1 text-[13px] font-medium text-text-2">Pessoas</h2>
      <div className="grid grid-cols-2 gap-3 [@media(min-width:560px)]:grid-cols-3 [@media(min-width:900px)]:grid-cols-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex flex-col items-center gap-2 rounded-[16px] border border-stroke bg-glass-dark p-4 text-center backdrop-blur-2xl"
          >
            <span className="relative">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-black text-[13px] font-medium text-white ${
                  m.online ? "" : "opacity-40"
                }`}
              >
                {initials(m.name)}
              </span>
              <span
                className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-bg-shell ${
                  m.online ? "bg-live" : "border-text-3 bg-transparent"
                }`}
              />
            </span>
            <span className="flex flex-wrap items-center justify-center gap-1">
              <span className="truncate text-[13px] font-medium text-text-1">{m.name}</span>
              {m.isSupporter && <SupporterBadge />}
            </span>
            <span className="text-[11px] text-text-3">{m.online ? "Online" : "Offline"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
