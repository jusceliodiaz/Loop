"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MonitorUp, Users } from "lucide-react";

type LiveParticipant = { identity: string; name: string; sharing: boolean };
type RoomLive = { roomId: string; roomName: string; participants: LiveParticipant[] };
type RoomRecap = { roomId: string; roomName: string; hours: number; uniqueUsers: string[]; lastActive: string | null };
type Activity = { live: RoomLive[]; recap: RoomRecap[] };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function relativeTime(iso: string | null) {
  if (!iso) return "sem atividade essa semana";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function AvatarStack({ participants }: { participants: LiveParticipant[] }) {
  const visible = participants.slice(0, 4);
  const overflow = participants.length - visible.length;
  return (
    <div className="flex items-center">
      {visible.map((p, i) => (
        <span
          key={p.identity}
          title={p.name}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-shell bg-black text-[11px] font-medium text-white"
          style={{ marginLeft: i === 0 ? 0 : -10, zIndex: visible.length - i }}
        >
          {initials(p.name)}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-shell bg-glass-2 text-[11px] font-medium text-text-1"
          style={{ marginLeft: -10 }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export function ActivityCards() {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/activity");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setActivity(data);
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

  if (!activity) {
    return <p className="text-[14.5px] text-text-2">Carregando atividade…</p>;
  }

  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 [@media(min-width:700px)]:grid-cols-2">
      {activity.live.map((room) => {
        const recap = activity.recap.find((r) => r.roomId === room.roomId);
        const sharing = room.participants.some((p) => p.sharing);

        return (
          <Link
            key={room.roomId}
            href={`/room/${room.roomId}`}
            className="stage-fade-in flex flex-col gap-4 rounded-[20px] border border-stroke bg-glass-dark p-5 backdrop-blur-2xl transition-colors hover:border-white/15"
            style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] font-medium text-text-1">
                <span className={`h-1.5 w-1.5 rounded-full ${room.participants.length > 0 ? "bg-live" : "bg-text-3/50"}`} />
                {room.roomName}
              </span>
              {sharing && (
                <span className="flex items-center gap-1 rounded-full bg-glass-1 px-2.5 py-1 text-[11px] text-text-2">
                  <MonitorUp size={12} strokeWidth={1.5} />
                  Compartilhando
                </span>
              )}
            </div>

            {room.participants.length > 0 ? (
              <AvatarStack participants={room.participants} />
            ) : (
              <p className="text-[13px] text-text-3">Ninguém aqui agora.</p>
            )}

            <div className="mt-auto flex items-center justify-between border-t border-stroke-soft pt-3 text-[12px] text-text-3">
              <span className="flex items-center gap-1.5">
                <Users size={13} strokeWidth={1.5} />
                {(recap?.hours ?? 0).toLocaleString("pt-BR")}h · {recap?.uniqueUsers.length ?? 0}{" "}
                {(recap?.uniqueUsers.length ?? 0) === 1 ? "pessoa" : "pessoas"} essa semana
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} strokeWidth={1.5} />
                {relativeTime(recap?.lastActive ?? null)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
