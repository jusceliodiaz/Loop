"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, Plus, Volume2 } from "lucide-react";
import { TEXT_ROOMS, VOICE_ROOMS } from "@/config/rooms";

export function RoomSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCounts(data.counts ?? {});
      } catch {
        // ignore transient network errors, next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="flex flex-col gap-3">
      <button
        type="button"
        className="flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] text-text-2 transition-colors hover:bg-glass-1 hover:text-text-1"
      >
        <Plus size={17} strokeWidth={1.5} />
        Criar sala
      </button>

      <div className="flex flex-col gap-0.5">
        {VOICE_ROOMS.map((room) => {
          const active = pathname === `/room/${room.id}`;
          const count = counts[room.id] ?? 0;
          const occupied = count > 0;
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

      <div className="flex flex-col gap-0.5">
        {TEXT_ROOMS.map((room) => {
          const active = pathname === `/room/${room.id}`;
          return (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className={`flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] transition-colors ${
                active ? "bg-glass-2 text-text-1" : "text-text-2 hover:bg-glass-1 hover:text-text-1"
              }`}
            >
              <MessageSquare size={15} strokeWidth={1.5} className="shrink-0 text-text-3" />
              <span className="flex-1 truncate">{room.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
