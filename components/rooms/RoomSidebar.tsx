"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROOMS } from "@/config/rooms";

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
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {ROOMS.map((room) => {
        const active = pathname === `/room/${room.id}`;
        const count = counts[room.id] ?? 0;
        return (
          <Link
            key={room.id}
            href={`/room/${room.id}`}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-[#1D1D23] text-[#F5F5F7]"
                : "text-[#98989F] hover:bg-[#1D1D23]/60 hover:text-[#F5F5F7]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${count > 0 ? "bg-[#7CF29C]" : "bg-[#3A3A42]"}`} />
              {room.name}
            </span>
            {count > 0 && <span className="text-xs text-[#98989F]">{count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
