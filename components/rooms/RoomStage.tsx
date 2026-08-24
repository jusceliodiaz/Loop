"use client";

import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { StageInner } from "./StageInner";

export function RoomStage({ roomId, roomName }: { roomId: string; roomName: string }) {
  const router = useRouter();
  const [connection, setConnection] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomId }),
        });
        if (!res.ok) throw new Error("Não foi possível entrar na sala.");
        const data = await res.json();
        if (!cancelled) setConnection({ token: data.token, url: data.url });
      } catch {
        if (!cancelled) setError("Não foi possível entrar na sala. Tente novamente.");
      }
    }

    connect();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-[#FF6B7A]">{error}</p>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-sm text-[#98989F]">Entrando na sala…</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={connection.token}
      serverUrl={connection.url}
      connect
      audio={{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
      className="flex flex-1 flex-col overflow-hidden"
      onDisconnected={() => router.push("/")}
    >
      <StageInner roomName={roomName} />
    </LiveKitRoom>
  );
}
